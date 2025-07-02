document.addEventListener('DOMContentLoaded', async function() {
    const scheduleContainer = document.getElementById('schedule-container');

    // ここをあなたのCloudflare WorkerのURLに置き換えてください
    const workerUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/schedule/upcoming'; 

    try {
        const response = await fetch(workerUrl);
        const schedules = await response.json();

        if (response.ok && schedules.length > 0) {
            scheduleContainer.innerHTML = ''; // 読み込み中メッセージをクリア
            schedules.forEach(item => {
                const scheduleDiv = document.createElement('div');
                scheduleDiv.classList.add('schedule-item');
                scheduleDiv.innerHTML = `
                    <h3>${item.date} ${item.title}</h3>
                    <p>時間: ${item.time}</p>
                    <p>場所: ${item.location}</p>
                `;
                scheduleContainer.appendChild(scheduleDiv);
            });
        } else if (response.ok && schedules.length === 0) {
            scheduleContainer.innerHTML = '<p>今後のスケジュールはありません。</p>';
        } else {
            scheduleContainer.innerHTML = `<p>スケジュールの読み込みに失敗しました: ${schedules.message || '不明なエラー'}</p>`;
            console.error('Failed to load schedules:', schedules);
        }
    } catch (error) {
        console.error('Error fetching schedules:', error);
        scheduleContainer.innerHTML = '<p>ネットワークエラーによりスケジュールを読み込めませんでした。</p>';
    }
});