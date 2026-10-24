<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Lead Acid Batteries') | Alaska Batteries</title>
    <meta name="description" content="@yield('description', 'Explore Alaska batteries, compare specifications and find the right power for your needs.')">
    <link rel="icon" href="/assets/favicon.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    @vite('resources/css/site.css')
    <link rel="stylesheet" href="/css/site-custom.css">
    <link rel="stylesheet" href="/css/catalog.css">
    @yield('head')
</head>
<body class="catalog-site">
    <div id="header-placeholder"></div>
    <main>@yield('content')</main>
    <div id="footer-placeholder"></div>
    <script src="/js/components.js" defer></script>
    @yield('scripts')
</body>
</html>
