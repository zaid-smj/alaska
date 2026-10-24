<div class="catalog-results-top"><div><p class="catalog-eyebrow">Explore our range</p><h2>Lead Acid Batteries</h2></div><p>{{ $count }} {{ Str::plural('battery', $count) }}</p></div>
@if ($sections->isEmpty())
    <div class="catalog-empty"><h3>No batteries found</h3><p>Try a different search or remove some tags.</p><a href="{{ route('catalog.lead-acid') }}">Clear filters</a></div>
@endif
@foreach ($sections as $section)
<section class="catalog-section" aria-labelledby="section-{{ $section->id }}">
    <div class="catalog-section-heading"><h2 id="section-{{ $section->id }}">{{ $section->name }}</h2><span>{{ $section->products->count() }} {{ Str::plural('model', $section->products->count()) }}</span></div>
    @if ($section->description)<p class="catalog-section-description">{{ $section->description }}</p>@endif
    <div class="catalog-grid">
    @foreach ($section->products as $product)
        <a class="catalog-card" href="{{ route('products.show', $product->slug) }}">
            <div class="catalog-card-image">@if ($product->image_url)<img src="{{ $product->image_url }}" alt="{{ $product->alt_text }}" loading="lazy" width="360" height="280">@else<span>Image coming soon</span>@endif</div>
            <div class="catalog-card-copy"><p class="catalog-eyebrow">Alaska Batteries</p><h3>{{ $product->name }}</h3><dl><div><dt>Plates</dt><dd>{{ $product->plates ?? '—' }}</dd></div><div><dt>Capacity</dt><dd>{{ $product->specifications()['Capacity (Ah)'] }}</dd></div></dl><span class="catalog-card-link">View battery <span aria-hidden="true">↗</span></span></div>
        </a>
    @endforeach
    </div>
</section>
@endforeach
