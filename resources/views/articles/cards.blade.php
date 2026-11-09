@foreach ($articles as $article)
<div class="blog-item original" onclick="openBlogModal('{{ $article->slug }}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openBlogModal('{{ $article->slug }}')}" aria-label="Read {{ $article->card_title ?: $article->title }}">
    <img src="{{ $article->image_url }}" alt="{{ $article->alt_text ?: $article->title }}" loading="lazy">
    <div class="wash-layer"></div>
    <div class="text-protection"></div>
    <div class="blog-content">
        <p class="category-tag">{{ $article->category }}</p>
        <h4 class="blog-title">{{ $article->card_title ?: $article->title }}</h4>
    </div>
</div>
@endforeach
