<script>
    (() => {
        const heartbeat = () => fetch(@js(route('admin.work-session.heartbeat')), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': @js(csrf_token()),
            },
        }).catch(() => {});

        heartbeat();
        window.setInterval(heartbeat, @js(config('work-sessions.heartbeat_interval') * 1000));
    })();
</script>
