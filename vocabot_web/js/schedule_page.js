document.addEventListener('DOMContentLoaded', async function() {
    const scheduleListContainer = document.getElementById('schedule-list-container');
    const calendarContainer = document.getElementById('calendar-container');
    const workerBaseUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/';

    let currentMonth = new Date();
    let allSchedules = []; // 全てのスケジュールデータを保持

    // スケジュールリストの読み込み
    async function loadScheduleList() {
        scheduleListContainer.innerHTML = '<p>スケジュールを読み込み中...</p>';
        try {
            const response = await fetch(workerBaseUrl + 'schedule/upcoming');
            const schedules = await response.json();

            if (response.ok && schedules.length > 0) {
                scheduleListContainer.innerHTML = '';
                schedules.forEach(item => {
                    const scheduleDiv = document.createElement('div');
                    scheduleDiv.classList.add('schedule-item');
                    scheduleDiv.innerHTML = `
                        <h3>${item.date} ${item.title}</h3>
                        <p>時間: ${item.time || ''} ${item.endDate ? `〜 ${item.endDate} ${item.endTime || ''}` : ''}</p>
                        <p>場所: ${item.location || ''}</p>
                    `;
                    scheduleListContainer.appendChild(scheduleDiv);
                });
            } else if (response.ok && schedules.length === 0) {
                scheduleListContainer.innerHTML = '<p>今後のスケジュールはありません。</p>';
            } else {
                scheduleListContainer.innerHTML = `<p>スケジュールの読み込みに失敗しました: ${schedules.message || '不明なエラー'}</p>`;
                console.error('Failed to load schedules:', schedules);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            scheduleListContainer.innerHTML = '<p>ネットワークエラーによりスケジュールを読み込めませんでした。</p>';
        }
    }

    // カレンダーの描画
    async function renderCalendar() {
        calendarContainer.innerHTML = ''; // クリア

        // 全てのスケジュールデータを取得 (カレンダー表示用)
        try {
            const response = await fetch(workerBaseUrl + 'schedule/all');
            allSchedules = await response.json();
            if (!response.ok || !Array.isArray(allSchedules)) {
                allSchedules = []; // エラー時は空にする
                console.error('Failed to fetch all schedules for calendar:', allSchedules);
            }
        } catch (error) {
            console.error('Error fetching all schedules for calendar:', error);
            allSchedules = [];
        }

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 時刻をリセットして日付のみ比較

        // カレンダーヘッダー
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('calendar-header');
        headerDiv.innerHTML = `
            <button id="prevMonth">&lt;</button>
            <h3>${year}年 ${month + 1}月</h3>
            <button id="nextMonth">&gt;</button>
        `;
        calendarContainer.appendChild(headerDiv);

        // カレンダーグリッド (曜日ヘッダー)
        const gridDiv = document.createElement('div');
        gridDiv.classList.add('calendar-grid');
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-day-header');
            dayHeader.textContent = day;
            gridDiv.appendChild(dayHeader);
        });

        // 月の最初の日の曜日まで空白セルを追加
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            gridDiv.appendChild(document.createElement('div'));
        }

        // 日付セルを追加
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('calendar-date');
            dateDiv.textContent = day;

            const currentDay = new Date(year, month, day);
            currentDay.setHours(0, 0, 0, 0); // 時刻をリセットして日付のみ比較

            // 今月の日付か判定
            if (currentDay.getMonth() === month) {
                dateDiv.classList.add('current-month');
            } else {
                dateDiv.classList.add('other-month');
            }

            // 今日か判定
            if (currentDay.toDateString() === today.toDateString()) {
                dateDiv.classList.add('today');
            }

            // イベントがあるか判定し、ハイライト表示
            const eventsForThisDay = allSchedules.filter(s => {
                const startDate = new Date(s.date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = s.endDate ? new Date(s.endDate) : startDate;
                endDate.setHours(0, 0, 0, 0);
                return currentDay >= startDate && currentDay <= endDate;
            });

            if (eventsForThisDay.length > 0) {
                // 複数日イベントの横棒表示
                eventsForThisDay.forEach(event => {
                    const startDate = new Date(event.date);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = event.endDate ? new Date(event.endDate) : startDate;
                    endDate.setHours(0, 0, 0, 0);

                    const eventBar = document.createElement('div');
                    eventBar.classList.add('event-bar');
                    eventBar.style.backgroundColor = event.color || '#00FFFF'; // イベントの色を横棒に適用

                    if (startDate.getTime() === endDate.getTime()) {
                        // 単一日のイベント
                        dateDiv.classList.add('single-day-event');
                        eventBar.style.width = '80%'; // 単日イベントのバーの幅
                        eventBar.style.margin = '0 auto';
                    } else if (startDate.getTime() === currentDay.getTime()) {
                        // 複数日イベントの開始日
                        eventBar.classList.add('event-bar-start');
                    } else if (endDate.getTime() === currentDay.getTime()) {
                        // 複数日イベントの終了日
                        eventBar.classList.add('event-bar-end');
                    } else if (currentDay > startDate && currentDay < endDate) {
                        // 複数日イベントの途中日
                        eventBar.classList.add('event-bar-middle');
                    }
                    dateDiv.appendChild(eventBar);
                });
            }

            gridDiv.appendChild(dateDiv);
        }

        calendarContainer.appendChild(gridDiv);

        // イベントリスナーを設定
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            renderCalendar();
        });
        document.getElementById('nextMonth').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            renderCalendar();
        });
    }

    // 初期ロード
    loadScheduleList();
    renderCalendar();
});