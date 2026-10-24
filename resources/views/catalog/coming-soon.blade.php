@extends('catalog.layout')
@section('title', $title)
@section('content')
<section class="catalog-coming-soon"><p class="catalog-eyebrow">Alaska / Solutions</p><h1>{{ $title }}</h1><p>Coming soon</p><a class="catalog-button" href="{{ route('catalog.lead-acid') }}">Explore Lead Acid batteries</a></section>
@endsection
