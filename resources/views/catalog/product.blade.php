@extends('catalog.layout')
@section('title', $product->name)
@section('content')
<div class="catalog-detail-shell">
    <nav class="catalog-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="{{ route('catalog.lead-acid') }}">Lead Acid</a><span>/</span><span>{{ $product->name }}</span></nav>
    <div class="catalog-detail-grid">
        <div class="catalog-detail-image">@if ($product->image_url)<img src="{{ $product->image_url }}" alt="{{ $product->alt_text }}">@else<p>Image coming soon</p>@endif</div>
        <div><p class="catalog-eyebrow">{{ $product->sections->pluck('name')->implode(' / ') }}</p><h1>{{ $product->name }}</h1>
            @if ($product->price_pkr !== null)<p class="catalog-price">PKR {{ number_format((float) $product->price_pkr, 2) }}</p>@endif
            @if ($product->description)<p class="catalog-product-description">{{ $product->description }}</p>@endif
            <div class="catalog-detail-tags">@foreach ($product->tags ?? [] as $tag)<span>{{ $tag }}</span>@endforeach</div>
            <div class="catalog-table-wrap"><table class="catalog-spec-table"><caption>Product specifications</caption><tbody>@foreach ($product->specifications() as $label => $value)<tr><th scope="row">{{ $label }}</th><td>{{ $value }}</td></tr>@endforeach</tbody></table></div>
            <p class="catalog-detail-note">More product information is coming soon.</p>
            <a class="catalog-button" href="{{ route('catalog.lead-acid') }}">Back to Lead Acid batteries</a>
        </div>
    </div>
</div>
@endsection
