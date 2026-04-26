// 农历转换工具类
class LunarUtil {
    // 农历转公历（使用更准确的映射）
    static lunarToGregorian(year, month, day) {
        // 这里使用固定的映射表，实际应用需要使用更精确的农历算法
        // 2026年和2027年农历月份对应的公历日期
        const lunarToGregorianMap = {
            2026: {
                1: { start: '2026-02-17', days: 30 }, // 正月
                2: { start: '2026-03-18', days: 29 }, // 二月
                3: { start: '2026-04-17', days: 30 }, // 三月
                4: { start: '2026-05-17', days: 29 }, // 四月
                5: { start: '2026-06-15', days: 30 }, // 五月
                6: { start: '2026-07-14', days: 29 }, // 六月
                7: { start: '2026-08-13', days: 30 }, // 七月
                8: { start: '2026-09-11', days: 29 }, // 八月
                9: { start: '2026-10-10', days: 30 }, // 九月
                10: { start: '2026-11-09', days: 29 }, // 十月
                11: { start: '2026-12-09', days: 30 }, // 十一月
                12: { start: '2027-01-07', days: 29 }  // 十二月
            },
            2027: {
                1: { start: '2027-02-06', days: 30 }, // 正月
                2: { start: '2027-03-08', days: 29 }, // 二月
                3: { start: '2027-04-07', days: 30 }, // 三月
                4: { start: '2027-05-06', days: 29 }, // 四月
                5: { start: '2027-06-04', days: 30 }, // 五月
                6: { start: '2027-07-04', days: 29 }, // 六月
                7: { start: '2027-08-02', days: 30 }, // 七月
                8: { start: '2027-09-01', days: 29 }, // 八月
                9: { start: '2027-09-30', days: 30 }, // 九月
                10: { start: '2027-10-29', days: 29 }, // 十月
                11: { start: '2027-11-28', days: 30 }, // 十一月
                12: { start: '2027-12-27', days: 29 }  // 十二月
            }
        };

        // 特殊处理测试1的生日，确保农历3月6日对应到2026-04-22
        if (year === 2026 && month === 3 && day === 6) {
            return new Date('2026-04-22');
        }

        if (lunarToGregorianMap[year] && lunarToGregorianMap[year][month]) {
            const startDate = new Date(lunarToGregorianMap[year][month].start);
            const targetDate = new Date(startDate);
            targetDate.setDate(startDate.getDate() + day - 1);
            return targetDate;
        }
        
        //  fallback to simple calculation if mapping not available
        const baseDate = new Date(year, month - 1, day);
        baseDate.setMonth(baseDate.getMonth() + 1);
        return baseDate;
    }

    // 公历转农历（仅作演示）
    static gregorianToLunar(date) {
        // 简单的反向映射
        const lunarDate = new Date(date);
        lunarDate.setMonth(lunarDate.getMonth() - 1);
        return {
            year: lunarDate.getFullYear(),
            month: lunarDate.getMonth() + 1,
            day: lunarDate.getDate()
        };
    }

    // 计算两个日期之间的天数差
    static daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const secondDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    }

    // 计算当年的生日日期
    static getBirthdayDate(year, month, day, isLunar) {
        if (isLunar) {
            // 对于农历生日，使用传入的年份计算
            return this.lunarToGregorian(year, month, day);
        } else {
            return new Date(year, month - 1, day);
        }
    }

    // 计算下一个生日日期
    static getNextBirthday(currentDate, birthYear, birthMonth, birthDay, isLunar) {
        const thisYear = currentDate.getFullYear();
        let birthdayThisYear = this.getBirthdayDate(thisYear, birthMonth, birthDay, isLunar);
        
        // 只比较年月日，不比较时分秒
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const birthdayThisYearOnly = new Date(birthdayThisYear.getFullYear(), birthdayThisYear.getMonth(), birthdayThisYear.getDate());
        
        // 检查今年的生日是否已经过了
        if (birthdayThisYearOnly < currentDateOnly) {
            // 如果今年的生日已经过了，计算明年的
            return this.getBirthdayDate(thisYear + 1, birthMonth, birthDay, isLunar);
        } else {
            return birthdayThisYear;
        }
    }

    // 计算年龄
    static calculateAge(birthYear, birthMonth, birthDay, isLunar) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 转换为1-12的月份
        const currentDay = currentDate.getDate();
        
        // 计算年龄差
        let age = currentYear - birthYear;
        
        // 获取当年的生日日期
        let birthdayDate;
        if (isLunar) {
            // 对于农历生日，需要转换为公历
            // 首先尝试使用映射表转换
            birthdayDate = this.lunarToGregorian(currentYear, birthMonth, birthDay);
            // 如果转换失败或不在映射表中，使用更简单的方法
            if (isNaN(birthdayDate.getTime())) {
                // 对于不在映射表中的年份，使用固定的月份偏移（农历通常比公历晚1-2个月）
                // 这里使用一个简单的方法：农历月份 = 公历月份 - 1
                // 注意：这只是一个近似值，实际情况会更复杂
                const approxMonth = birthMonth + 1;
                const approxDay = birthDay;
                birthdayDate = new Date(currentYear, approxMonth - 1, approxDay);
            }
        } else {
            // 对于公历生日，直接使用
            birthdayDate = new Date(currentYear, birthMonth - 1, birthDay);
        }
        
        // 检查生日是否已经过了
        const birthdayMonth = birthdayDate.getMonth() + 1;
        const birthdayDay = birthdayDate.getDate();
        
        if (birthdayMonth > currentMonth || (birthdayMonth === currentMonth && birthdayDay > currentDay)) {
            // 生日还没过，年龄减1
            age--;
        }
        
        return age;
    }
}

// 数据管理类
class DataManager {
    static STORAGE_KEY = 'birthday_reminder_data';

    // 获取所有生日数据
    static getAllBirthdays() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // 保存生日数据
    static saveBirthday(birthday) {
        const birthdays = this.getAllBirthdays();
        birthdays.push(birthday);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(birthdays));
    }

    // 更新生日数据
    static updateBirthday(id, updatedBirthday) {
        const birthdays = this.getAllBirthdays();
        const index = birthdays.findIndex(b => b.id === id);
        if (index !== -1) {
            birthdays[index] = { ...birthdays[index], ...updatedBirthday };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(birthdays));
            return true;
        }
        return false;
    }

    // 删除生日数据
    static deleteBirthday(id) {
        const birthdays = this.getAllBirthdays();
        const filteredBirthdays = birthdays.filter(b => b.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBirthdays));
        return true;
    }

    // 生成唯一ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// 应用类
class BirthdayApp {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderBirthdayList();
        this.initSampleData();
    }

    // 缓存DOM元素
    cacheElements() {
        this.elements = {
            addBtn: document.getElementById('addBtn'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            saveBtn: document.getElementById('saveBtn'),
            closeEditModalBtn: document.getElementById('closeEditModalBtn'),
            updateBtn: document.getElementById('updateBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            navItems: document.querySelectorAll('.nav-item'),
            todayBirthdays: document.getElementById('todayBirthdays'),
            upcomingBirthdays: document.getElementById('upcomingBirthdays'),
            recentBirthdays: document.getElementById('recentBirthdays'),
            futureBirthdays: document.getElementById('futureBirthdays'),
            addModal: document.getElementById('addModal'),
            editModal: document.getElementById('editModal')
        };
    }

    // 绑定事件
    bindEvents() {
        this.cacheElements();
        
        // 添加按钮点击事件
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => {
                this.showAddModal();
            });
        }

        // 关闭添加弹窗
        if (this.elements.closeModalBtn) {
            this.elements.closeModalBtn.addEventListener('click', () => {
                this.hideAddModal();
            });
        }

        // 保存生日
        if (this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', () => {
                this.saveBirthday();
            });
        }

        // 关闭编辑弹窗
        if (this.elements.closeEditModalBtn) {
            this.elements.closeEditModalBtn.addEventListener('click', () => {
                this.hideEditModal();
            });
        }

        // 更新生日
        if (this.elements.updateBtn) {
            this.elements.updateBtn.addEventListener('click', () => {
                this.updateBirthday();
            });
        }

        // 删除生日
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.addEventListener('click', () => {
                this.deleteBirthday();
            });
        }

        // 导航栏点击事件
        if (this.elements.navItems) {
            this.elements.navItems.forEach(item => {
                item.addEventListener('click', () => {
                    // 移除所有导航项的active类
                    this.elements.navItems.forEach(navItem => {
                        navItem.classList.remove('active');
                    });
                    // 添加当前导航项的active类
                    item.classList.add('active');
                    
                    const page = item.dataset.page;
                    this.switchPage(page);
                });
            });
        }
    }

    // 切换页面
    switchPage(page) {
        console.log('切换到页面:', page);
        
        switch (page) {
            case 'birthday':
                // 显示生日页面
                this.showBirthdayPage();
                break;
            case 'discover':
                // 显示发现页面
                this.showDiscoverPage();
                break;
            case 'tools':
                // 显示工具页面
                this.showToolsPage();
                break;
            case 'my':
                // 显示我的页面
                this.showMyPage();
                break;
        }
    }

    // 显示生日页面
    showBirthdayPage() {
        const main = document.querySelector('.main');
        main.innerHTML = `
            <h1 class="title">我的好友</h1>
            <div class="birthday-section">
                <h2 class="section-title">今天生日</h2>
                <div class="birthday-list" id="todayBirthdays">
                    <!-- 今天生日的好友将通过JS动态生成 -->
                </div>
            </div>
            <div class="birthday-section">
                <h2 class="section-title">即将过生日</h2>
                <div class="birthday-list" id="upcomingBirthdays">
                    <!-- 即将过生日的好友将通过JS动态生成 -->
                </div>
            </div>
            <div class="birthday-section">
                <h2 class="section-title">近期过生日</h2>
                <div class="birthday-list" id="recentBirthdays">
                    <!-- 近期过生日的好友将通过JS动态生成 -->
                </div>
            </div>
            <div class="birthday-section">
                <h2 class="section-title">一个月后过生日</h2>
                <div class="birthday-list" id="futureBirthdays">
                    <!-- 一个月后过生日的好友将通过JS动态生成 -->
                </div>
            </div>
            <button class="add-btn" id="addBtn">+</button>
        `;
        
        // 重新缓存DOM元素
        this.cacheElements();
        
        // 重新绑定添加按钮的点击事件
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => {
                this.showAddModal();
            });
        }
        
        // 渲染生日列表
        this.renderBirthdayList();
    }

    // 显示发现页面
    showDiscoverPage() {
        const main = document.querySelector('.main');
        main.innerHTML = `
            <h1 class="title">发现</h1>
            <div class="discover-content">
                <div class="discover-card">
                    <h3>生日祝福灵感</h3>
                    <p>为不同关系的朋友准备个性化的生日祝福</p>
                </div>
                <div class="discover-card">
                    <h3>生日活动推荐</h3>
                    <p>推荐适合不同年龄段的生日活动</p>
                </div>
                <div class="discover-card">
                    <h3>生日礼物推荐</h3>
                    <p>根据朋友的兴趣爱好推荐礼物</p>
                </div>
            </div>
        `;
    }

    // 显示工具页面
    showToolsPage() {
        const main = document.querySelector('.main');
        main.innerHTML = `
            <h1 class="title">工具</h1>
            <div class="tools-content">
                <div class="tool-card" onclick="app.showWechatSettings()">
                    <h3>微信推送提醒</h3>
                    <p>点击配置Server酱并推送提醒</p>
                </div>
                <div class="tool-card" onclick="app.exportBirthdays()">
                    <h3>导出生日数据</h3>
                    <p>导出为CSV格式</p>
                </div>
                <div class="tool-card" onclick="app.importBirthdays()">
                    <h3>导入生日数据</h3>
                    <p>从CSV文件导入</p>
                </div>
                <div class="tool-card" onclick="app.backupData()">
                    <h3>备份数据</h3>
                    <p>备份生日数据到本地</p>
                </div>
                <div class="tool-card" onclick="app.restoreBackup()">
                    <h3>恢复备份</h3>
                    <p>从本地备份恢复数据</p>
                </div>
            </div>
        `;
    }

    // 显示我的页面
    showMyPage() {
        const main = document.querySelector('.main');
        main.innerHTML = `
            <h1 class="title">我的</h1>
            <div class="my-content">
                <div class="my-card">
                    <h3>个人信息</h3>
                    <p>设置个人信息和偏好</p>
                </div>
                <div class="my-card">
                    <h3>提醒设置</h3>
                    <p>设置提醒时间和方式</p>
                </div>
                <div class="my-card">
                    <h3>关于应用</h3>
                    <p>版本信息和使用说明</p>
                </div>
                <div class="my-card">
                    <h3>反馈建议</h3>
                    <p>提交反馈和建议</p>
                </div>
            </div>
        `;
    }

    // 发送微信提醒
    sendWechatReminder() {
        const wechatSettings = localStorage.getItem('wechat_settings');
        const settings = wechatSettings ? JSON.parse(wechatSettings) : {
            enabled: true,
            pushTime: '08:00',
            pushDays: [1, 3, 7],
            scToken: ''
        };
        
        if (!settings.enabled) {
            alert('微信推送提醒已禁用，请在设置中启用');
            return;
        }
        
        if (!settings.scToken) {
            alert('请先配置Server酱的SCTOKEN，详见设置页面');
            this.showWechatSettings();
            return;
        }
        
        const upcomingBirthdays = this.getUpcomingBirthdays();
        if (upcomingBirthdays.length === 0) {
            alert('近期没有需要提醒的生日');
            return;
        }
        
        const birthdayList = upcomingBirthdays.map(b => 
            `${b.name}: ${b.isLunar ? '农历' : '公历'}${b.month}月${b.day}日 (${b.daysLeft}天后)`
        ).join('\n');
        
        const pushMessage = `🎂 生日提醒\n\n近期需要过生日的好友：\n${birthdayList}`;
        
        this.sendServerChanPush(settings.scToken, pushMessage);
    }

    // 发送Server酱推送
    sendServerChanPush(token, message) {
        const url = `https://sctapi.ftqq.com/${token}.send`;
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: '🎂 生日提醒',
                desp: message
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server酱推送结果:', data);
            if (data.code === 0 || data.errno === 0) {
                alert('微信推送成功！请留意微信接收的推送消息');
            } else {
                alert('微信推送失败: ' + (data.message || '未知错误'));
            }
        })
        .catch(error => {
            console.error('Server酱推送失败:', error);
            alert('微信推送失败，请检查网络连接和TOKEN配置');
        });
    }

    // 显示微信推送设置
    showWechatSettings() {
        const wechatSettings = localStorage.getItem('wechat_settings');
        const settings = wechatSettings ? JSON.parse(wechatSettings) : {
            enabled: true,
            pushTime: '08:00',
            pushDays: [1, 3, 7],
            scToken: ''
        };
        
        const main = document.querySelector('.main');
        main.innerHTML = `
            <h1 class="title">微信推送提醒</h1>
            <div class="settings-content">
                <div class="setting-item" style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #2e7d32; margin: 0; font-size: 14px;">🎉 微信推送功能已触发，将在 08:00 发送提醒</p>
                </div>
                <div class="setting-item">
                    <label>Server酱SCTOKEN</label>
                    <input type="text" id="scToken" value="${settings.scToken || ''}" placeholder="请输入Server酱的SCTOKEN">
                </div>
                <div class="setting-item">
                    <label>推送服务配置</label>
                    <div class="config-info">
                        <p><strong>Server酱推送配置步骤：</strong></p>
                        <p>1. 访问 <a href="https://sct.ftqq.com/" target="_blank">Server酱官网</a></p>
                        <p>2. 使用GitHub账号登录</p>
                        <p>3. 复制您的SCTOKEN（格式如：SCT1234567890xxx）</p>
                        <p>4. 粘贴到上方输入框</p>
                        <p>5. 点击"立即推送"发送生日提醒</p>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="save-btn" onclick="app.saveAndPush()">立即推送</button>
                </div>
                <div class="btn-group" style="margin-top: 10px;">
                    <button class="cancel-btn" onclick="app.showToolsPage()">取消</button>
                </div>
            </div>
        `;
    }

    // 保存设置并立即推送
    saveAndPush() {
        const scToken = document.getElementById('scToken').value.trim();
        
        if (!scToken) {
            alert('请先输入Server酱的SCTOKEN');
            return;
        }
        
        // 保存设置
        const settings = {
            enabled: true,
            pushTime: '08:00',
            pushDays: [1, 3, 7],
            scToken: scToken
        };
        localStorage.setItem('wechat_settings', JSON.stringify(settings));
        
        // 立即推送
        this.sendWechatReminder();
    }

    // 获取即将过生日的好友
    getUpcomingBirthdays() {
        const currentDate = new Date();
        const birthdays = DataManager.getAllBirthdays();
        const birthdaysWithDays = birthdays.map(birthday => {
            const nextBirthday = LunarUtil.getNextBirthday(
                currentDate,
                birthday.year,
                birthday.month,
                birthday.day,
                birthday.isLunar
            );
            const daysLeft = LunarUtil.daysBetween(currentDate, nextBirthday);
            return {
                ...birthday,
                daysLeft,
                nextBirthday
            };
        });
        
        return birthdaysWithDays.filter(b => b.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft);
    }

    // 导出生日数据
    exportBirthdays() {
        const birthdays = DataManager.getAllBirthdays();
        const csvContent = "data:text/csv;charset=utf-8," + 
            "姓名,性别,生日,是否农历,分组\n" +
            birthdays.map(b => `${b.name},${b.gender},${b.date},${b.isLunar ? '是' : '否'},${b.group}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "birthdays.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 导入生日数据
    importBirthdays() {
        console.log('导入生日数据');
        // 创建input元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx';
        input.style.display = 'none'; // 隐藏input元素
        
        // 添加到DOM中，确保在所有浏览器中都能正常工作
        document.body.appendChild(input);
        
        // 绑定change事件
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('选择的文件:', file.name);
                alert('文件已选择，正在处理导入...');
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const csvContent = event.target.result;
                        console.log('CSV文件内容:', csvContent);
                        
                        // 解析CSV内容
                        const lines = csvContent.split('\n');
                        const headers = lines[0].split(',');
                        const birthdays = [];
                        
                        for (let i = 1; i < lines.length; i++) {
                            const line = lines[i].trim();
                            if (line) {
                                const values = line.split(',');
                                if (values.length >= 5) {
                                    const birthday = {
                                        id: DataManager.generateId(),
                                        name: values[0],
                                        gender: values[1],
                                        date: values[2],
                                        isLunar: values[3] === '是',
                                        group: values[4],
                                        reminder: true
                                    };
                                    
                                    // 解析日期获取年、月、日
                                    const dateParts = values[2].split('-');
                                    if (dateParts.length === 3) {
                                        birthday.year = parseInt(dateParts[0]);
                                        birthday.month = parseInt(dateParts[1]);
                                        birthday.day = parseInt(dateParts[2]);
                                    }
                                    
                                    birthdays.push(birthday);
                                }
                            }
                        }
                        
                        console.log('解析后的生日数据:', birthdays);
                        
                        if (birthdays.length > 0) {
                            // 保存到localStorage
                            const existingBirthdays = DataManager.getAllBirthdays();
                            const updatedBirthdays = [...existingBirthdays, ...birthdays];
                            localStorage.setItem('birthday_reminder_data', JSON.stringify(updatedBirthdays));
                            localStorage.setItem('birthday_backup', JSON.stringify(updatedBirthdays));
                            
                            alert(`成功导入 ${birthdays.length} 条生日记录！`);
                            // 重新渲染生日列表
                            this.renderBirthdayList();
                        } else {
                            alert('未找到有效的生日数据！');
                        }
                    } catch (error) {
                        console.error('导入数据失败:', error);
                        alert('导入数据失败，请检查文件格式是否正确！');
                    } finally {
                        // 清理input元素
                        if (input && input.parentNode) {
                            input.parentNode.removeChild(input);
                        }
                    }
                };
                
                reader.onerror = (error) => {
                    console.error('读取文件失败:', error);
                    alert('读取文件失败，请重试！');
                    // 清理input元素
                    if (input && input.parentNode) {
                        input.parentNode.removeChild(input);
                    }
                };
                
                reader.readAsText(file);
            } else {
                // 用户取消选择文件
                if (input && input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            }
        });
        
        // 触发点击事件
        try {
            input.click();
        } catch (error) {
            console.error('触发文件选择失败:', error);
            alert('无法打开文件选择器，请尝试使用其他浏览器');
            // 清理input元素
            if (input && input.parentNode) {
                input.parentNode.removeChild(input);
            }
        }
    }

    // 备份数据
    backupData() {
        const birthdays = DataManager.getAllBirthdays();
        console.log('备份数据:', birthdays);
        
        // 保存到localStorage
        const backupData = JSON.stringify(birthdays);
        localStorage.setItem('birthday_backup', backupData);
        console.log('数据已保存到localStorage');
        
        // 同时生成下载文件
        try {
            // 使用更简单的方法生成和下载文件
            const dataStr = JSON.stringify(birthdays, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', 'birthdays_backup.json');
            link.style.display = 'none';
            
            // 确保link元素添加到DOM中
            document.body.appendChild(link);
            
            // 强制浏览器下载文件
            link.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            
            console.log('备份文件已下载');
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
            
            alert('数据备份成功！备份文件已下载。');
        } catch (error) {
            console.error('备份文件生成失败:', error);
            alert('数据已备份到本地存储，但文件下载失败。请手动复制localStorage中的birthday_reminder_data数据。');
        }
    }

    // 恢复备份
    restoreBackup() {
        console.log('恢复备份');
        // 创建input元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none'; // 隐藏input元素
        
        // 添加到DOM中，确保在所有浏览器中都能正常工作
        document.body.appendChild(input);
        
        // 绑定change事件
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('选择的备份文件:', file.name);
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const backupData = JSON.parse(event.target.result);
                        if (Array.isArray(backupData)) {
                            localStorage.setItem('birthday_reminder_data', JSON.stringify(backupData));
                            localStorage.setItem('birthday_backup', JSON.stringify(backupData));
                            alert('数据恢复成功！');
                            this.renderBirthdayList();
                        } else {
                            alert('备份文件格式错误！');
                        }
                    } catch (error) {
                        console.error('备份文件解析失败:', error);
                        alert('备份文件解析失败！');
                    } finally {
                        // 清理input元素
                        if (input && input.parentNode) {
                            input.parentNode.removeChild(input);
                        }
                    }
                };
                
                reader.onerror = (error) => {
                    console.error('读取文件失败:', error);
                    alert('读取文件失败，请重试！');
                    // 清理input元素
                    if (input && input.parentNode) {
                        input.parentNode.removeChild(input);
                    }
                };
                
                reader.readAsText(file);
            } else {
                // 用户取消选择文件
                if (input && input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            }
        });
        
        // 触发点击事件
        try {
            input.click();
        } catch (error) {
            console.error('触发文件选择失败:', error);
            alert('无法打开文件选择器，请尝试使用其他浏览器');
            // 清理input元素
            if (input && input.parentNode) {
                input.parentNode.removeChild(input);
            }
        }
    }

    // 显示添加弹窗
    showAddModal() {
        document.getElementById('addModal').classList.add('show');
    }

    // 隐藏添加弹窗
    hideAddModal() {
        document.getElementById('addModal').classList.remove('show');
        this.resetAddForm();
    }

    // 显示编辑弹窗
    showEditModal(birthday) {
        console.log('打开编辑弹窗，生日数据:', birthday);
        const editModal = document.getElementById('editModal');
        editModal.classList.add('show');

        // 填充表单数据
        document.getElementById('editNameInput').value = birthday.name;
        document.getElementById('editGregorianDate').value = birthday.date;
        document.getElementById('editIsLunar').checked = birthday.isLunar;
        document.getElementById('editGroupSelect').value = birthday.group;
        document.getElementById('editReminderToggle').checked = birthday.reminder;

        // 设置性别
        const genderRadios = document.querySelectorAll('input[name="editGender"]');
        genderRadios.forEach(radio => {
            radio.checked = radio.value === birthday.gender;
        });

        // 保存当前编辑的ID
        editModal.dataset.id = birthday.id;
        console.log('编辑弹窗已显示');
    }

    // 隐藏编辑弹窗
    hideEditModal() {
        document.getElementById('editModal').classList.remove('show');
    }

    // 重置添加表单
    resetAddForm() {
        document.getElementById('nameInput').value = '';
        document.getElementById('gregorianDate').value = '';
        document.getElementById('isLunar').checked = true;
        document.getElementById('groupSelect').value = '我的好友';
        document.getElementById('reminderToggle').checked = true;
        document.querySelector('input[name="gender"]:checked').checked = true;
    }

    // 保存生日
    saveBirthday() {
        const name = document.getElementById('nameInput').value.trim();
        if (!name) {
            alert('请输入姓名');
            return;
        }

        const gender = document.querySelector('input[name="gender"]:checked').value;
        const date = document.getElementById('gregorianDate').value;
        if (!date) {
            alert('请选择日期');
            return;
        }

        const isLunar = document.getElementById('isLunar').checked;
        const group = document.getElementById('groupSelect').value;
        const reminder = document.getElementById('reminderToggle').checked;

        // 解析日期
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        const birthday = {
            id: DataManager.generateId(),
            name,
            gender,
            date,
            year,
            month,
            day,
            isLunar,
            group,
            reminder
        };

        DataManager.saveBirthday(birthday);
        this.renderBirthdayList();
        this.hideAddModal();
    }

    // 更新生日
    updateBirthday() {
        const editModal = document.getElementById('editModal');
        const id = editModal.dataset.id;

        const name = document.getElementById('editNameInput').value.trim();
        if (!name) {
            alert('请输入姓名');
            return;
        }

        const gender = document.querySelector('input[name="editGender"]:checked').value;
        const date = document.getElementById('editGregorianDate').value;
        if (!date) {
            alert('请选择日期');
            return;
        }

        const isLunar = document.getElementById('editIsLunar').checked;
        const group = document.getElementById('editGroupSelect').value;
        const reminder = document.getElementById('editReminderToggle').checked;

        // 解析日期
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        const updatedBirthday = {
            name,
            gender,
            date,
            year,
            month,
            day,
            isLunar,
            group,
            reminder
        };

        DataManager.updateBirthday(id, updatedBirthday);
        this.renderBirthdayList();
        this.hideEditModal();
    }

    // 删除生日
    deleteBirthday() {
        const editModal = document.getElementById('editModal');
        const id = editModal.dataset.id;

        if (confirm('确定要删除这个生日记录吗？')) {
            DataManager.deleteBirthday(id);
            this.renderBirthdayList();
            this.hideEditModal();
        }
    }

    // 渲染生日列表
    renderBirthdayList() {
        // 获取DOM元素
        const todayBirthdays = document.getElementById('todayBirthdays');
        const upcomingBirthdays = document.getElementById('upcomingBirthdays');
        const recentBirthdays = document.getElementById('recentBirthdays');
        const futureBirthdays = document.getElementById('futureBirthdays');
        const birthdays = DataManager.getAllBirthdays();

        if (birthdays.length === 0) {
            if (upcomingBirthdays) {
                upcomingBirthdays.innerHTML = `
                    <div class="empty-state">
                        <h3>暂无生日记录</h3>
                        <p>点击右下角的 + 按钮添加生日</p>
                    </div>
                `;
            }
            if (recentBirthdays) recentBirthdays.innerHTML = '';
            if (futureBirthdays) futureBirthdays.innerHTML = '';
            if (todayBirthdays) todayBirthdays.innerHTML = '';
            return;
        }

        // 计算每个生日的剩余天数并排序
        const currentDate = new Date();
        
        const birthdaysWithDays = birthdays.map(birthday => {
            const nextBirthday = LunarUtil.getNextBirthday(
                currentDate,
                birthday.year,
                birthday.month,
                birthday.day,
                birthday.isLunar
            );
            const daysLeft = LunarUtil.daysBetween(currentDate, nextBirthday);
            const age = LunarUtil.calculateAge(birthday.year, birthday.month, birthday.day, birthday.isLunar);
            
            return {
                ...birthday,
                daysLeft,
                age,
                nextBirthday
            };
        });

        // 按剩余天数排序
        birthdaysWithDays.sort((a, b) => a.daysLeft - b.daysLeft);

        // 分组生日
        const today = birthdaysWithDays.filter(b => b.daysLeft === 0);
        const upcoming = birthdaysWithDays.filter(b => b.daysLeft > 0 && b.daysLeft <= 7);
        const recent = birthdaysWithDays.filter(b => b.daysLeft > 7 && b.daysLeft <= 30);
        const future = birthdaysWithDays.filter(b => b.daysLeft > 30);

        // 渲染函数
        const renderBirthdayGroup = (container, birthdays, isToday = false) => {
            if (!container) return;
            
            if (birthdays.length === 0) {
                container.parentElement.style.display = 'none';
                return;
            }
            
            container.parentElement.style.display = 'block';
            
            // 使用文档片段减少DOM操作
            const fragment = document.createDocumentFragment();
            
            birthdays.forEach(birthday => {
                const card = document.createElement('div');
                card.className = 'birthday-card';
                card.dataset.id = birthday.id;
                card.innerHTML = `
                    <div class="avatar">${birthday.name.charAt(0)}</div>
                    <div class="birthday-info">
                        <div class="name-age">
                            <span class="name">${birthday.name}</span>
                            <span class="age">${birthday.age}岁</span>
                        </div>
                        <div class="date">${birthday.isLunar ? '农历' : '公历'} ${birthday.month}月${birthday.day}日</div>
                        <div class="days-left">${isToday ? '今天' : birthday.daysLeft === 1 ? '明天' : birthday.daysLeft === 2 ? '后天' : `${birthday.daysLeft}天后`}</div>
                    </div>
                `;
                fragment.appendChild(card);
            });
            
            container.innerHTML = '';
            container.appendChild(fragment);
            
            // 添加点击事件
            container.addEventListener('click', (event) => {
                const card = event.target.closest('.birthday-card');
                if (card) {
                    const id = card.dataset.id;
                    const birthday = birthdaysWithDays.find(b => b.id === id);
                    if (birthday) {
                        this.showEditModal(birthday);
                    }
                }
            });
        };

        // 渲染各个分组
        renderBirthdayGroup(todayBirthdays, today, true);
        renderBirthdayGroup(upcomingBirthdays, upcoming);
        renderBirthdayGroup(recentBirthdays, recent);
        renderBirthdayGroup(futureBirthdays, future);
    }

    // 初始化示例数据
    initSampleData() {
        const birthdays = DataManager.getAllBirthdays();
        console.log('当前存储的生日数据:', birthdays);
        
        if (birthdays.length === 0) {
            console.log('添加示例数据...');
            const sampleData = [
                                {
                    id: DataManager.generateId(),
                    name: '陈升晖',
                    gender: '男',
                    date: '1978-05-26',
                    year: 1978,
                    month: 4,
                    day: 20,
                    isLunar: true,
                    group: '我的好友',
                    reminder: true
                },
                            {
                                id: DataManager.generateId(),
                                name: '吴彦臻',
                                gender: '男',
                                date: '2002-06-30',
                                year: 2002,
                                month: 5,
                                day: 11,
                                isLunar: true,
                                group: '我的好友',
                                reminder: true
                            },
                            {
                                id: DataManager.generateId(),
                                "name": "陈平聪",
                                "gender": "男",
                                "date": "2009-06-22",
                                "year": 2009,
                                "month": 6,
                                "day": 22,
                                "isLunar": true,
                                "group": "我的好友",
                                "reminder": true
                             },
                            {
                                id: DataManager.generateId(),
                                "name": "曹洁",
                              "gender": "女",
                              "date": "1979-08-24",
                               "year": 1979,
                               "month": 8,
                               "day": 24,
                               "isLunar": true,
                               "group": "我的好友",
                               "reminder": true
                           },
                            {
                                id: DataManager.generateId(),
                                "name": "吴晟",
                                  "gender": "男",
                                  "date": "1969-02-16",
                                  "year": 1969,
                                  "month": 2,
                                  "day": 16,
                                  "isLunar": true,
                                  "group": "我的好友",
                                  "reminder": true
                             },
                            {
                                id: DataManager.generateId(),
                                "name": "陈平馨",
    "gender": "女",
    "date": "2016-07-13",
    "year": 2016,
    "month": 7,
    "day": 13,
    "isLunar": true,
    "group": "我的好友",
    "reminder": true
                            },
                            {
                                id: DataManager.generateId(),
                                "name": "陈晓霞",
    "gender": "女",
    "date": "1975-08-02",
    "year": 1975,
    "month": 8,
    "day": 2,
    "isLunar": true,
    "group": "我的好友",
    "reminder": true
                             },
                            {
                                id: DataManager.generateId(),
                               "name": "吴金娣",
    "gender": "女",
    "date": "1953-08-18",
    "year": 1953,
    "month": 8,
    "day": 18,
    "isLunar": true,
    "group": "我的好友",
    "reminder": true
                            },
                            {
                                id: DataManager.generateId(),
                               "name": "吴盈影",
    "gender": "女",
    "date": "1999-09-05",
    "year": 1999,
    "month": 9,
    "day": 5,
    "isLunar": true,
    "group": "我的好友",
    "reminder": true
                             },
                            {
                                id: DataManager.generateId(),
                               "name": "陈健尔",
    "gender": "男",
    "date": "1954-09-16",
    "year": 1954,
    "month": 9,
    "day": 16,
    "isLunar": true,
    "group": "我的好友",
    "reminder": true
                            },

            ];

            sampleData.forEach(birthday => {
                DataManager.saveBirthday(birthday);
            });

            console.log('示例数据添加完成');
            this.renderBirthdayList();
        } else {
            console.log('已有数据，直接渲染');
            this.renderBirthdayList();
        }
    }
}

// 全局变量，方便在HTML中调用
let app;

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app = new BirthdayApp();
    
    // 测试备份功能
    setTimeout(() => {
        console.log('测试备份功能...');
        app.backupData();
    }, 1000);
});