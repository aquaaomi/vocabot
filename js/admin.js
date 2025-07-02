document.addEventListener('DOMContentLoaded', function() {
    const workerBaseUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/';

    // 議事録フォーム
    document.getElementById('minuteForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('minuteTitle').value;
        const content = document.getElementById('minuteContent').value;
        const messageElement = document.getElementById('minuteMessage');
        await postData(workerBaseUrl + 'minutes/post', { title, content }, messageElement, this);
    });

    // お知らせフォーム
    document.getElementById('announcementForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;
        const messageElement = document.getElementById('announcementMessage');
        await postData(workerBaseUrl + 'announcements/post', { title, content }, messageElement, this);
    });

    // スケジュールフォーム
    document.getElementById('scheduleForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('scheduleTitle').value;
        const date = document.getElementById('scheduleDate').value;
        const time = document.getElementById('scheduleTime').value;
        const location = document.getElementById('scheduleLocation').value;
        const messageElement = document.getElementById('scheduleMessage');
        await postData(workerBaseUrl + 'schedule/post', { title, date, time, location }, messageElement, this);
    });

    async function postData(url, data, messageElement, formElement) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = '投稿が成功しました！';
                messageElement.style.color = 'green';
                formElement.reset(); // フォームをリセット
                // 投稿成功後、投稿一覧を更新
                if (typeof loadPosts === 'function') {
                    loadPosts(); 
                }
            } else {
                messageElement.textContent = `投稿に失敗しました: ${result.message || '不明なエラー'}`;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            messageElement.textContent = 'ネットワークエラーが発生しました。';
            messageElement.style.color = 'red';
        }
    }
});