#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生日提醒微信推送脚本（GitHub Actions / 本机通用）

数据源（优先级）：
  1. 环境变量 BIRTHDAYS_JSON（GitHub Secret，推荐，隐私安全）
  2. 仓库内 birthdays.json（本地调试 / 私有仓库方案）

推送渠道：Server酱（方糖） sctapi.ftqq.com
  - token 取自环境变量 SERVERCHAN_TOKEN
  - 消息直达个人微信服务通知（PC 端 / 手机端微信都能收到）

行为：
  - 仅推送 分组在 PUSH_GROUPS、且 reminder 为真的成员
  - 仅当"距下次生日天数"落在 PUSH_DAYS 时推送（默认提前 1 天）
  - 农历生日使用 lunar_python 精确换算（已修正原 app 写死映射表 2月/12月差1天的 bug）
"""

import os
import io
import sys
import json
import datetime
import urllib.request
import urllib.parse

# 兼容 Windows / 中文输出
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
except Exception:
    pass

# ---------------------------------------------------------------------------
# 配置（均可用环境变量覆盖）
# ---------------------------------------------------------------------------
PUSH_GROUPS = [g.strip() for g in os.environ.get("PUSH_GROUPS", "我的好友").split(",") if g.strip()]
try:
    PUSH_DAYS = [int(x) for x in os.environ.get("PUSH_DAYS", "1").split(",") if x.strip()]
except ValueError:
    PUSH_DAYS = [1]
SERVERCHAN_TOKEN = os.environ.get("SERVERCHAN_TOKEN", "")
BIRTHDAYS_JSON_ENV = os.environ.get("BIRTHDAYS_JSON", "")
DRY_RUN = os.environ.get("DRY_RUN", "").lower() in ("1", "true", "yes")

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DATA_PATH = os.path.join(HERE, "..", "birthdays.json")


# ---------------------------------------------------------------------------
# 数据加载
# ---------------------------------------------------------------------------
def load_birthdays():
    """返回生日成员列表。优先用 Secret，回退到仓库文件。"""
    source = None
    if BIRTHDAYS_JSON_ENV:
        try:
            data = json.loads(BIRTHDAYS_JSON_ENV)
            source = "环境变量 BIRTHDAYS_JSON (Secret)"
        except json.JSONDecodeError as e:
            print(f"[错误] BIRTHDAYS_JSON 解析失败：{e}")
            sys.exit(1)
    else:
        try:
            with open(DEFAULT_DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            source = f"仓库文件 {DEFAULT_DATA_PATH}"
        except FileNotFoundError:
            print("[错误] 未设置 BIRTHDAYS_JSON 环境变量，且仓库内 birthdays.json 不存在。")
            sys.exit(1)

    # 兼容 {"people": [...]} 与 [...] 两种格式
    if isinstance(data, dict):
        data = data.get("people", [])
    if not isinstance(data, list):
        print("[错误] 生日数据格式不正确，应为数组。")
        sys.exit(1)
    print(f"[信息] 数据源：{source}，共 {len(data)} 条记录")
    return data


# ---------------------------------------------------------------------------
# 农历转换
# ---------------------------------------------------------------------------
def _lunar_to_solar(year, month, day):
    """农历转公历，返回 datetime.date。"""
    from lunar_python import Lunar, Solar
    lunar = Lunar.fromYmd(year, month, day)
    solar = lunar.getSolar()
    return datetime.date(solar.getYear(), solar.getMonth(), solar.getDay())


def next_birthday(person, today):
    """
    计算某人的"下一个生日"对应的公历日期，以及距今天数。
    返回 (date, days_left, kind) 或 None（数据无效）。
    """
    try:
        y = int(person.get("year"))
        m = int(person.get("month"))
        d = int(person.get("day"))
    except (TypeError, ValueError):
        return None

    is_lunar = bool(person.get("isLunar", False))

    if is_lunar:
        # 农历：今年与明年各自的公历对应日，取 >= today 的最近者
        candidates = []
        for yy in (today.year, today.year + 1):
            try:
                candidates.append(_lunar_to_solar(yy, m, d))
            except Exception:
                pass
        candidates = [c for c in candidates if c >= today]
        if not candidates:
            return None
        target = min(candidates)
        kind = "农历"
    else:
        # 公历
        try:
            c1 = datetime.date(today.year, m, d)
        except ValueError:
            return None
        c2 = datetime.date(today.year + 1, m, d)
        target = c1 if c1 >= today else c2
        kind = "公历"

    return target, (target - today).days, kind


# ---------------------------------------------------------------------------
# 推送
# ---------------------------------------------------------------------------
def push_serverchan(token, title, content):
    """调用 Server酱 推送。返回 (ok, message)。"""
    url = f"https://sctapi.ftqq.com/{token}.send"
    post_data = urllib.parse.urlencode({"title": title, "desp": content}).encode("utf-8")
    req = urllib.request.Request(url, data=post_data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8", errors="replace")
        result = json.loads(body)
        if result.get("code") == 0:
            return True, result.get("message", "OK")
        return False, body
    except Exception as e:  # noqa: BLE001
        return False, str(e)


def build_message(matched):
    """生成推送正文。"""
    lines = []
    for p in matched:
        name = p["name"]
        solar = p["solar"]
        lunar = p["lunar_label"]
        kind = p["kind"]
        days = p["days_left"]
        when = "明天" if days == 1 else f"{days} 天后"
        lines.append(f"· {name}（{kind}）：{when}（{solar}）{lunar}")
    header = "🎂 生日提醒 · 提前 1 天"
    body = "以下家人即将过生日，请提前准备：\n\n" + "\n".join(lines)
    return header, body


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
def main():
    today = datetime.date.today()
    print(f"[信息] 当前日期（运行环境时区）：{today.isoformat()}")
    print(f"[信息] 推送分组：{PUSH_GROUPS}；提前天数：{PUSH_DAYS}")

    people = load_birthdays()

    matched = []
    skipped_group = 0
    skipped_reminder = 0
    invalid = 0
    for p in people:
        name = p.get("name", "(无名)")
        group = p.get("group", "")
        reminder = p.get("reminder", True)

        if PUSH_GROUPS and group not in PUSH_GROUPS:
            skipped_group += 1
            continue
        if reminder is False:
            skipped_reminder += 1
            continue

        nb = next_birthday(p, today)
        if nb is None:
            invalid += 1
            print(f"[警告] 跳过无效记录：{name}")
            continue
        target, days_left, kind = nb
        p["solar"] = target.isoformat()
        p["kind"] = kind
        p["days_left"] = days_left

        if days_left in PUSH_DAYS:
            # 农历标签
            if kind == "农历":
                p["lunar_label"] = f"（农历 {int(p['month'])}月{int(p['day'])}日）"
            else:
                p["lunar_label"] = ""
            matched.append(p)
            print(f"[命中] {name} {kind}生日 {target}（距 {days_left} 天）")
        else:
            print(f"[跳过] {name} {kind}生日 {target}（距 {days_left} 天，不在提前范围内）")

    print(f"[统计] 命中 {len(matched)} 人；因分组跳过 {skipped_group}；因未开启提醒跳过 {skipped_reminder}；无效 {invalid}")

    if not matched:
        print("[完成] 今天没有需要提前提醒的生日。")
        return

    title, content = build_message(matched)
    print("---- 推送内容预览 ----")
    print(content)
    print("----------------------")

    if DRY_RUN:
        print("[DRY_RUN] 未真正发送推送。")
        return

    if not SERVERCHAN_TOKEN:
        print("[错误] 未设置 SERVERCHAN_TOKEN，无法推送。请在 Secrets 中配置。")
        sys.exit(1)

    ok, msg = push_serverchan(SERVERCHAN_TOKEN, title, content)
    if ok:
        print(f"[成功] 已推送 {len(matched)} 条生日提醒。")
    else:
        print(f"[失败] 推送返回：{msg}")
        sys.exit(1)


if __name__ == "__main__":
    main()
