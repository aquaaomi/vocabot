document.addEventListener('DOMContentLoaded', async function() {
    const announcementsContainer = document.getElementById('announcements-container');

    // ここをあなたのCloudflare WorkerのURLに置き換えてください
    const workerUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/announcements/all'; 

    try {
        const response = await fetch(workerUrl);
        const announcements = await response.json();

        if (response.ok && announcements.length > 0) {
            announcementsContainer.innerHTML = ''; // 読み込み中メッセージをクリア
            announcements.forEach(announcement => {
                const announcementDiv = document.createElement('div');
                announcementDiv.classList.add('announcement-item');
                announcementDiv.innerHTML = `
                    <h3>${announcement.date} ${announcement.title}</h3>
                    <div class="markdown-content">${announcement.content}</div>
                `;
                announcementsContainer.appendChild(announcementDiv);
            });
        } else if (response.ok && announcements.length === 0) {
            announcementsContainer.innerHTML = '<p>まだお知らせがありません。</p>';
        } else {
            announcementsContainer.innerHTML = `<p>お知らせの読み込みに失敗しました: ${announcements.message || '不明なエラー'}</p>`;
            console.error('Failed to load announcements:', announcements);
        }
    } catch (error) {
        console.error('Error fetching announcements:', error);
        announcementsContainer.innerHTML = '<p>ネットワークエラーによりお知らせを読み込めませんでした。</p>';
    }
});