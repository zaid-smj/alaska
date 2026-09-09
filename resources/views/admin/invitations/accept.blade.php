<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Accept Admin Invitation</title>

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
                    Accept your invitation
                </h1>

                <p class="mt-3 text-sm leading-6 text-zinc-600">
                    Create your administrator account for
                    <strong class="font-semibold text-zinc-900">{{ $invitation->email }}</strong>.
                </p>

                <form
                    method="POST"
                    action="{{ route('admin.invitations.store', ['token' => $token]) }}"
                    class="mt-8 space-y-5"
                >
                    @csrf

                    <div>
                        <label for="email" class="block text-sm font-semibold text-zinc-800">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value="{{ $invitation->email }}"
                            disabled
                            class="mt-2 block w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 py-3 text-zinc-500"
                        >
                        @error('email')
                            <p class="mt-2 text-sm font-medium text-red-700">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="name" class="block text-sm font-semibold text-zinc-800">
                            Full name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value="{{ old('name') }}"
                            autocomplete="name"
                            required
                            autofocus
                            @class([
                                'mt-2 block w-full rounded-lg border bg-white px-3.5 py-3 text-zinc-950 outline-none transition focus:border-[#c00d1e] focus:ring-4 focus:ring-red-100',
                                'border-red-500' => $errors->has('name'),
                                'border-zinc-300' => ! $errors->has('name'),
                            ])
                            @error('name') aria-invalid="true" aria-describedby="name-error" @enderror
                        >
                        @error('name')
                            <p id="name-error" class="mt-2 text-sm font-medium text-red-700">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-semibold text-zinc-800">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="new-password"
                            required
                            @class([
                                'mt-2 block w-full rounded-lg border bg-white px-3.5 py-3 text-zinc-950 outline-none transition focus:border-[#c00d1e] focus:ring-4 focus:ring-red-100',
                                'border-red-500' => $errors->has('password'),
                                'border-zinc-300' => ! $errors->has('password'),
                            ])
                            aria-describedby="password-help @error('password') password-error @enderror"
                            @error('password') aria-invalid="true" @enderror
                        >
                        <p id="password-help" class="mt-2 text-xs leading-5 text-zinc-500">
                            Use at least 12 characters, including uppercase and lowercase letters, a number, and a symbol.
                        </p>
                        @error('password')
                            <p id="password-error" class="mt-2 text-sm font-medium text-red-700">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="password_confirmation" class="block text-sm font-semibold text-zinc-800">
                            Confirm password
                        </label>
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-zinc-950 outline-none transition focus:border-[#c00d1e] focus:ring-4 focus:ring-red-100"
                        >
                    </div>

                    <button
                        type="submit"
                        class="flex w-full items-center justify-center rounded-lg bg-[#c00d1e] px-4 py-3 font-bold text-white transition hover:bg-[#a40b19] focus:outline-none focus:ring-4 focus:ring-red-200"
                    >
                        Create Admin Account
                    </button>
                </form>
            </div>
        </section>
    </main>
</body>
</html>
