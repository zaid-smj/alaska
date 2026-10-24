<?php

namespace App\Http\Controllers;

use App\Models\CatalogBanner;
use App\Models\Product;
use App\Models\ProductSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProductCatalogController extends Controller
{
    public function index(Request $request): View
    {
        $data = $request->validate(['q' => ['nullable', 'string', 'max:200'], 'tags' => ['nullable', 'array'], 'tags.*' => ['string', 'in:Automotive,Backup,Industrial']]);
        $search = trim($data['q'] ?? '');
        $tags = array_values(array_unique($data['tags'] ?? []));
        $products = Product::published()->with('sections')->orderBy('sort_order')->orderBy('name')->get()
            ->filter(fn (Product $product): bool => $product->matchesSearch($search) && collect($tags)->every(fn ($tag) => in_array($tag, $product->tags ?? [], true)));
        $sections = ProductSection::orderBy('sort_order')->orderBy('id')->get()->map(function (ProductSection $section) use ($products) {
            $section->setRelation('products', $products->filter(fn (Product $product) => $product->sections->contains('id', $section->id)));

            return $section;
        })->filter(fn (ProductSection $section) => $section->products->isNotEmpty());

        return view('catalog.index', ['sections' => $sections, 'banner' => CatalogBanner::first(), 'search' => $search, 'tags' => $tags, 'count' => $products->count()]);
    }

    public function show(string $slug): View
    {
        $product = Product::published()->with('sections')->where('slug', $slug)->firstOrFail();

        return view('catalog.product', compact('product'));
    }

    public function compareSearch(Request $request): JsonResponse
    {
        $data = $request->validate(['q' => ['nullable', 'string', 'max:200']]);
        $query = trim($data['q'] ?? '');
        $products = Product::published()->orderBy('name')
            ->when($query !== '', fn ($builder) => $builder->where('name', 'like', '%'.addcslashes($query, '%_\\').'%'))
            ->limit(20)->get();

        return response()->json($products->map(fn (Product $product) => ['id' => $product->id, 'name' => $product->name, 'image' => $product->image_url, 'url' => route('products.show', $product->slug), 'specifications' => $product->specifications()]));
    }

    public function comingSoon(string $type): View
    {
        abort_unless(in_array($type, ['lithium-ion', 'inverters'], true), 404);

        return view('catalog.coming-soon', ['title' => $type === 'lithium-ion' ? 'Lithium Ion' : 'Inverters']);
    }
}
