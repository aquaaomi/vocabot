document.addEventListener('DOMContentLoaded', async function() {
    const minutesContainer = document.getElementById('minutes-container');

    // ここをあなたのCloudflare WorkerのURLに置き換えてください
    const workerUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/minutes/all'; 

    try {
        const response = await fetch(workerUrl);
        const minutes = await response.json();

        if (response.ok && minutes.length > 0) {
            minutesContainer.innerHTML = ''; // 読み込み中メッセージをクリア
            minutes.forEach(minute => {
                const minuteDiv = document.createElement('div');
                minuteDiv.id = minute.timestamp; // アンカーリンク用
                minuteDiv.classList.add('minute-item');
                minuteDiv.innerHTML = `
                    <h3>${minute.date} ${minute.title}</h3>
                    <div class="markdown-content">${minute.content}</div>
                `;
                minutesContainer.appendChild(minuteDiv);
            });
        } else if (response.ok && minutes.length === 0) {
            minutesContainer.innerHTML = '<p>まだ議事録がありません。</p>';
        } else {
            minutesContainer.innerHTML = `<p>議事録の読み込みに失敗しました: ${minutes.message || '不明なエラー'}</p>`;
            console.error('Failed to load minutes:', minutes);
        }
    } catch (error) {
        console.error('Error fetching minutes:', error);
        minutesContainer.innerHTML = '<p>ネットワークエラーにより議事録を読み込めませんでした。</p>';
    }
});