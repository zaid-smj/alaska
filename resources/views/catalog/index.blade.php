@extends('catalog.layout')
@section('content')
<section class="catalog-hero" aria-labelledby="catalog-title">
    <picture>
        <source media="(max-width: 640px)" srcset="{{ $banner?->mobile_image_url ?? asset('assets/solutions/solutions-hero.webp') }}">
        <img src="{{ $banner?->image_url ?? asset('assets/solutions/solutions-hero.webp') }}" alt="{{ $banner?->alt_text ?? 'Alaska batteries' }}" fetchpriority="high">
    </picture>
    <div class="catalog-hero-copy"><p class="catalog-eyebrow">Alaska / Solutions</p><h1 id="catalog-title">{{ $banner?->title ?? 'Lead Acid Batteries' }}</h1><p>{{ $banner?->subtitle }}</p></div>
</section>
<div class="catalog-shell">
    <aside class="catalog-sidebar" aria-label="Battery filters">
        <details id="catalog-filters" open>
            <summary>Find your battery <span aria-hidden="true">＋</span></summary>
            <form id="catalog-filter-form" method="get" action="{{ route('catalog.lead-acid') }}">
                <div class="catalog-filter-block">
                    <label for="catalog-search">Search batteries</label>
                    <div class="catalog-search-wrap"><input id="catalog-search" type="search" name="q" value="{{ $search }}" maxlength="200" placeholder="Name, specifications, uses…" aria-describedby="search-hint"><button type="submit" aria-label="Search batteries">⌕</button></div>
                    <p id="search-hint">Search name, plates, voltage, capacity (Ah), warranty, weight, box size, dimensions, tags and uses.</p>
                </div>
                <fieldset class="catalog-filter-block"><legend>Automotive Battery</legend>
                    <p>Vehicle matching is coming soon.</p>
                    @foreach (['Make', 'Model', 'Year'] as $field)
                    <label for="vehicle-{{ strtolower($field) }}">{{ $field }}</label>
                    <select id="vehicle-{{ strtolower($field) }}" aria-describedby="vehicle-hint"><option>Coming soon</option></select>
                    @endforeach
                    <p id="vehicle-hint">Vehicle selections will be available when compatibility data is added.</p>
                </fieldset>
                <fieldset class="catalog-filter-block"><legend>Tags</legend><p>Choose multiple to match every selected tag.</p>
                    <div class="catalog-tags">
                    @foreach (App\Models\Product::TAGS as $tag)
                        <label class="catalog-tag"><input type="checkbox" name="tags[]" value="{{ $tag }}" @checked(in_array($tag, $tags))><span>{{ $tag }}</span></label>
                    @endforeach
                    </div>
                </fieldset>
                <div class="catalog-filter-actions"><button type="submit" class="catalog-button">Apply filters</button><a href="{{ route('catalog.lead-acid') }}" id="catalog-reset">Reset filters</a></div>
            </form>
            <div class="catalog-filter-block catalog-compare-block"><h2>Compare batteries</h2><p>See two batteries side by side.</p><button type="button" class="catalog-button catalog-button-outline" id="compare-open">Compare two batteries <span aria-hidden="true">↔</span></button></div>
        </details>
    </aside>
    <div class="catalog-results" id="catalog-results" aria-live="polite" aria-atomic="false">
        @include('catalog.results')
    </div>
</div>
<dialog id="catalog-compare" class="catalog-dialog" aria-labelledby="compare-title">
    <div class="catalog-dialog-top"><div><p class="catalog-eyebrow">Side by side</p><h2 id="compare-title">Compare batteries</h2></div><button type="button" id="compare-close" class="catalog-close" aria-label="Close comparison">×</button></div>
    <p>Choose two different Lead Acid batteries. Catalog filters do not affect this search.</p>
    <div class="catalog-compare-selectors">
    @foreach ([1, 2] as $slot)
        <div class="catalog-compare-slot" data-slot="{{ $slot }}">
            <label for="compare-search-{{ $slot }}">Battery {{ $slot }}</label>
            <input type="search" id="compare-search-{{ $slot }}" maxlength="200" placeholder="Search by product name" autocomplete="off" aria-controls="compare-options-{{ $slot }}">
            <div id="compare-options-{{ $slot }}" class="catalog-options" aria-live="polite"></div>
            <div class="catalog-selected" id="compare-selected-{{ $slot }}" aria-live="polite">No battery selected</div>
        </div>
    @endforeach
    </div>
    <p id="compare-message" role="status">Select two batteries to compare their specifications.</p>
    <div id="compare-table" class="catalog-table-wrap"></div>
</dialog>
@endsection
@section('scripts')<script src="/js/catalog.js" defer></script>@endsection
