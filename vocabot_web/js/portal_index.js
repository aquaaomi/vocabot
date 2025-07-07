document.addEventListener('DOMContentLoaded', async function() {
    const latestMinutesDiv = document.getElementById('latest-minutes');
    const latestAnnouncementsDiv = document.getElementById('latest-announcements');
    const upcomingScheduleDiv = document.getElementById('upcoming-schedule');

    // ここをあなたのCloudflare WorkerのURLに置き換えてください
    const workerBaseUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/'; 

    // 議事録の読み込み
    try {
        const response = await fetch(workerBaseUrl + 'minutes/latest');
        const minutes = await response.json();

        if (response.ok && minutes.length > 0) {
            latestMinutesDiv.innerHTML = '';
            const ul = document.createElement('ul');
            minutes.forEach(minute => {
                const li = document.createElement('li');
                li.classList.add('portal-list-item'); // 新しいクラスを追加
                li.innerHTML = `<a href="./minutes_list.html#${minute.timestamp}">${minute.date} ${minute.title}</a>`;
                ul.appendChild(li);
            });
            latestMinutesDiv.appendChild(ul);
        } else if (response.ok && minutes.length === 0) {
            latestMinutesDiv.innerHTML = '<p>まだ議事録がありません。</p>';
        } else {
            latestMinutesDiv.innerHTML = `<p>議事録の読み込みに失敗しました: ${minutes.message || '不明なエラー'}</p>`;
            console.error('Failed to load minutes:', minutes);
        }
    } catch (error) {
        console.error('Error fetching latest minutes:', error);
        latestMinutesDiv.innerHTML = '<p>ネットワークエラーにより議事録を読み込めませんでした。</p>';
    }

    // お知らせの読み込み (最新4件を表示)
    try {
        const response = await fetch(workerBaseUrl + 'announcements/all'); // 全て取得してJSでフィルタリング
        const announcements = await response.json();

        if (response.ok && announcements.length > 0) {
            latestAnnouncementsDiv.innerHTML = '';
            const ul = document.createElement('ul');
            // 最新4件を抽出
            const latest4Announcements = announcements.slice(0, 4);
            latest4Announcements.forEach(announcement => {
                const li = document.createElement('li');
                li.classList.add('portal-list-item'); // 新しいクラスを追加
                li.innerHTML = `<a href="./announcements_list.html#${announcement.timestamp}">${announcement.date} ${announcement.title}</a>`;
                ul.appendChild(li);
            });
            latestAnnouncementsDiv.appendChild(ul);
        } else if (response.ok && announcements.length === 0) {
            latestAnnouncementsDiv.innerHTML = '<p>まだお知らせがありません。</p>';
        } else {
            latestAnnouncementsDiv.innerHTML = `<p>お知らせの読み込みに失敗しました: ${announcements.message || '不明なエラー'}</p>`;
            console.error('Failed to load announcements:', announcements);
        }
    } catch (error) {
        console.error('Error fetching latest announcements:', error);
        latestAnnouncementsDiv.innerHTML = '<p>ネットワークエラーによりお知らせを読み込めませんでした。</p>';
    }

    // スケジュールの読み込み (今後のスケジュールを表示)
    try {
        const response = await fetch(workerBaseUrl + 'schedule/upcoming');
        const schedules = await response.json();

        if (response.ok && schedules.length > 0) {
            upcomingScheduleDiv.innerHTML = '';
            const ul = document.createElement('ul');
            schedules.forEach(schedule => {
                const li = document.createElement('li');
                li.classList.add('portal-list-item'); // 新しいクラスを追加
                li.innerHTML = `<strong>${schedule.date}</strong>: ${schedule.title} (${schedule.time}) - ${schedule.location}`; 
                ul.appendChild(li);
            });
            upcomingScheduleDiv.appendChild(ul);
        } else if (response.ok && schedules.length === 0) {
            upcomingScheduleDiv.innerHTML = '<p>今後のスケジュールはありません。</p>';
        } else {
            upcomingScheduleDiv.innerHTML = `<p>スケジュールの読み込みに失敗しました: ${schedules.message || '不明なエラー'}</p>`;
            console.error('Failed to load schedules:', schedules);
        }
    } catch (error) {
        console.error('Error fetching upcoming schedules:', error);
        upcomingScheduleDiv.innerHTML = '<p>ネットワークエラーによりスケジュールを読み込めませんでした。</p>';
    }
});

// 管理用ページへの簡易パスワードチェック
function checkAdminPassword(event) {
    event.preventDefault(); // デフォルトのリンク遷移を防止
    const password = prompt("管理用ページにアクセスするにはパスワードを入力してください:");
    if (password === "vbotadmin") {
        window.location.href = "./admin.html";
    } else if (password !== null) { // キャンセルボタンが押された場合は何もしない
        alert("パスワードが違います。");
    }
}