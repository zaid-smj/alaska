@extends('catalog.layout')
@section('title', $product->name)
@section('content')
@php($specifications = $product->specifications())
<div class="catalog-detail-shell">
    <nav class="catalog-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="{{ route('catalog.lead-acid') }}">Lead Acid</a><span>/</span><span>{{ $product->name }}</span></nav>
    <article class="catalog-detail-grid" aria-labelledby="product-title">
        <div class="catalog-detail-image">@if ($product->image_url)<img src="{{ $product->image_url }}" alt="{{ $product->alt_text }}">@else<p>Image coming soon</p>@endif</div>
        <div class="catalog-detail-copy">
            <p class="catalog-eyebrow">{{ $product->sections->pluck('name')->implode(' / ') }}</p>
            <h1 id="product-title">{{ $product->name }}</h1>
            <p class="catalog-detail-technology">Lead Acid Battery</p>
            @if ($product->price_pkr !== null)<p class="catalog-price">PKR {{ number_format((float) $product->price_pkr, 2) }}</p>@endif
            <dl class="catalog-key-specs">
                @foreach (['Plates' => 'Plates', 'Voltage' => 'Voltage', 'Capacity (Ah)' => 'Ampere'] as $field => $label)
                <div><dt>{{ $label }}</dt><dd>{{ $specifications[$field] }}</dd></div>
                @endforeach
            </dl>
            @if ($product->uses)
            <div class="catalog-recommended-usage"><h2>Recommended usage</h2><p>{{ $product->uses }}</p></div>
            @endif
            <details class="catalog-more-details">
                <summary><span class="catalog-details-icon" aria-hidden="true">+</span>More details</summary>
                <div class="catalog-expanded-details">
                    @if ($product->description)<p class="catalog-product-description">{{ $product->description }}</p>@endif
                    <div class="catalog-table-wrap"><table class="catalog-spec-table"><caption>Product specifications</caption><tbody>@foreach ($specifications as $label => $value)<tr><th scope="row">{{ $label }}</th><td>{{ $value }}</td></tr>@endforeach</tbody></table></div>
                </div>
            </details>
            @if ($product->tags)
            <div class="catalog-detail-tags" aria-label="Product tags">@foreach ($product->tags as $tag)<span>{{ $tag }}</span>@endforeach</div>
            @endif
        </div>
    </article>
    <a class="catalog-detail-back" href="{{ route('catalog.lead-acid') }}">← Back to Lead Acid batteries</a>
</div>
@endsection
