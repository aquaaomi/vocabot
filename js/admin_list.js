document.addEventListener('DOMContentLoaded', function() {
    const postListDiv = document.getElementById('post-list');
    const workerBaseUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/';

    window.loadPosts = async function() {
        postListDiv.innerHTML = '<p>投稿を読み込み中...</p>';
        try {
            // 議事録の取得
            const minutesResponse = await fetch(workerBaseUrl + 'minutes/all');
            const minutes = await minutesResponse.json();

            // お知らせの取得
            const announcementsResponse = await fetch(workerBaseUrl + 'announcements/all');
            const announcements = await announcementsResponse.json();

            // スケジュールの取得
            const scheduleResponse = await fetch(workerBaseUrl + 'schedule/all'); // 全てのスケジュールを取得するAPIが必要
            const schedules = await scheduleResponse.json();

            let allPosts = [];

            if (minutesResponse.ok && Array.isArray(minutes)) {
                allPosts = allPosts.concat(minutes.map(item => ({ ...item, type: 'minute', displayTitle: `${item.date} ${item.title}` })));
            }
            if (announcementsResponse.ok && Array.isArray(announcements)) {
                allPosts = allPosts.concat(announcements.map(item => ({ ...item, type: 'announcement', displayTitle: `${item.date} ${item.title}` })));
            }
            if (scheduleResponse.ok && Array.isArray(schedules)) {
                allPosts = allPosts.concat(schedules.map(item => ({ ...item, type: 'schedule', displayTitle: `${item.date} ${item.title} (${item.time})` })));
            }

            allPosts.sort((a, b) => b.timestamp - a.timestamp); // 最新順にソート

            if (allPosts.length > 0) {
                postListDiv.innerHTML = '';
                allPosts.forEach(post => {
                    const postItem = document.createElement('div');
                    postItem.classList.add('post-item');
                    postItem.innerHTML = `
                        <span>[${post.type === 'minute' ? '議事録' : post.type === 'announcement' ? 'お知らせ' : 'スケジュール'}] ${post.displayTitle}</span>
                        <button class="delete-btn" data-type="${post.type}" data-key="${post.type}:${post.date}-${post.timestamp}">削除</button>
                    `;
                    postListDiv.appendChild(postItem);
                });

                // 削除ボタンのイベントリスナーを設定
                postListDiv.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', async function() {
                        const type = this.dataset.type;
                        const key = this.dataset.key;
                        if (confirm(`この${type === 'minute' ? '議事録' : type === 'announcement' ? 'お知らせ' : 'スケジュール'}を削除しますか？`)) {
                            await deletePost(type, key);
                        }
                    });
                });
            } else {
                postListDiv.innerHTML = '<p>まだ投稿がありません。</p>';
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            postListDiv.innerHTML = '<p>投稿の読み込みに失敗しました。</p>';
        }
    };

    async function deletePost(type, key) {
        try {
            const response = await fetch(workerBaseUrl + `${type}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: key }),
            });

            if (response.ok) {
                alert('削除しました。');
                loadPosts(); // 投稿一覧を再読み込み
            } else {
                const errorData = await response.json();
                alert(`削除に失敗しました: ${errorData.message || '不明なエラー'}`);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('ネットワークエラーにより削除できませんでした。');
        }
    }

    loadPosts(); // ページ読み込み時に投稿一覧をロード
});