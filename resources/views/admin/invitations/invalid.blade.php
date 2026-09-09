<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation unavailable</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-zinc-100 text-zinc-950 antialiased">
    <main class="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
        <section class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <div class="h-2 bg-[#c00d1e]"></div>

            <div class="p-7 sm:p-10">
                <p class="text-sm font-bold uppercase tracking-[0.18em] text-[#c00d1e]">
                    Alaska Admin Portal
                </p>

                <h1 class="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                    Invitation unavailable
                </h1>

                <p class="mt-4 leading-7 text-zinc-600">
                    This invitation link is invalid, expired, revoked, or has already been used.
                </p>

                <p class="mt-3 text-sm leading-6 text-zinc-500">
                    Ask the Super Admin to send you a new invitation if you still need access.
                </p>

                <a
                    href="{{ url('/admin') }}"
                    class="mt-8 flex w-full items-center justify-center rounded-lg bg-[#c00d1e] px-4 py-3 font-bold text-white transition hover:bg-[#a40b19] focus:outline-none focus:ring-4 focus:ring-red-200"
                >
                    Return to admin login
                </a>
            </div>
        </section>
    </main>
</body>
</html>
