<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\GalleryImages\GalleryImageResource;
use App\Filament\Resources\GalleryImages\Pages\CreateGalleryImage;
use App\Filament\Resources\GalleryImages\Pages\ListGalleryImages;
use App\Filament\Resources\HomeBannerSlides\HomeBannerSlideResource;
use App\Filament\Resources\HomeBannerSlides\Pages\CreateHomeBannerSlide;
use App\Filament\Resources\HomeBannerSlides\Pages\ListHomeBannerSlides;
use App\Models\AuditLog;
use App\Models\GalleryImage;
use App\Models\HomeBannerSlide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class ContentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_existing_banner_and_gallery_content_is_imported(): void
    {
        $this->assertSame(3, HomeBannerSlide::count());
        $this->assertSame(19, GalleryImage::count());

        $this->assertDatabaseHas('home_banner_slides', [
            'legacy_desktop_path' => 'assets/slider-home/slide-1.webp',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('gallery_images', [
            'category' => 'corporate',
            'legacy_image_path' => 'assets/gallery/corp/corp-3.jpg',
            'is_active' => true,
        ]);
    }

    public function test_both_admin_roles_can_manage_banner_and_gallery_content(): void
    {
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $superAdmin = User::factory()->create(['role' => AdminRole::SuperAdmin]);

        $this->actingAs($admin);
        $this->assertTrue(HomeBannerSlideResource::canViewAny());
        $this->assertTrue(HomeBannerSlideResource::canCreate());
        $this->assertTrue(GalleryImageResource::canViewAny());
        $this->assertTrue(GalleryImageResource::canCreate());

        $this->actingAs($superAdmin);
        $this->assertTrue(HomeBannerSlideResource::canViewAny());
        $this->assertTrue(HomeBannerSlideResource::canCreate());
        $this->assertTrue(GalleryImageResource::canViewAny());
        $this->assertTrue(GalleryImageResource::canCreate());

        auth()->logout();
        $this->assertFalse(HomeBannerSlideResource::canViewAny());
        $this->assertFalse(HomeBannerSlideResource::canCreate());
        $this->assertFalse(GalleryImageResource::canViewAny());
        $this->assertFalse(GalleryImageResource::canCreate());
    }

    public function test_content_management_list_and_create_screens_render_for_an_admin(): void
    {
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        $this->actingAs($admin);

        Livewire::test(ListHomeBannerSlides::class)->assertSuccessful();
        Livewire::test(CreateHomeBannerSlide::class)->assertSuccessful();
        Livewire::test(ListGalleryImages::class)->assertSuccessful();
        Livewire::test(CreateGalleryImage::class)->assertSuccessful();
    }

    public function test_home_page_receives_active_managed_banner_slides_in_display_order(): void
    {
        HomeBannerSlide::query()->update(['is_active' => false]);

        HomeBannerSlide::create([
            'title' => 'Second managed banner',
            'alt_text' => 'Second banner',
            'legacy_desktop_path' => 'assets/slider-home/slide-2.webp',
            'sort_order' => 20,
            'is_active' => true,
        ]);

        HomeBannerSlide::create([
            'title' => 'First managed banner',
            'alt_text' => 'First banner',
            'legacy_desktop_path' => 'assets/slider-home/slide-1.webp',
            'sort_order' => 10,
            'is_active' => true,
        ]);

        $response = $this->get(route('site.home'));

        $response->assertOk()
            ->assertSee('window.ALASKA_CONTENT', false)
            ->assertSee('First managed banner')
            ->assertSee('Second managed banner');

        $this->assertLessThan(
            strpos($response->getContent(), 'Second managed banner'),
            strpos($response->getContent(), 'First managed banner'),
        );
    }

    public function test_gallery_page_receives_only_active_managed_images(): void
    {
        GalleryImage::query()->update(['is_active' => false]);

        GalleryImage::create([
            'category' => 'awards',
            'legacy_image_path' => 'assets/gallery/awards/award-2.jpg',
            'alt_text' => 'Managed award image',
            'caption' => 'Company award',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->get(route('site.vault'))
            ->assertOk()
            ->assertSee('window.ALASKA_CONTENT', false)
            ->assertSee('Managed award image')
            ->assertSee('Company award');
    }

    public function test_banner_and_gallery_changes_are_audited_with_the_admin_actor(): void
    {
        $admin = User::factory()->create(['role' => AdminRole::Admin]);
        AuditLog::query()->delete();
        $this->actingAs($admin);

        $slide = HomeBannerSlide::create([
            'title' => 'Launch banner',
            'alt_text' => 'Launch banner image',
            'legacy_desktop_path' => 'assets/slider-home/slide-1.webp',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $slide->update(['title' => 'Updated launch banner']);
        $slide->delete();

        $image = GalleryImage::create([
            'category' => 'corporate',
            'legacy_image_path' => 'assets/gallery/corp/corp-3.jpg',
            'alt_text' => 'Factory team',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $image->update(['caption' => 'Our factory team']);
        $image->delete();

        foreach ([
            'content.banner.created',
            'content.banner.updated',
            'content.banner.deleted',
            'content.gallery.created',
            'content.gallery.updated',
            'content.gallery.deleted',
        ] as $event) {
            $this->assertDatabaseHas('audit_logs', [
                'event' => $event,
                'actor_id' => $admin->id,
            ]);
        }
    }

    public function test_existing_website_pages_and_public_assets_are_available(): void
    {
        $this->get('/index.html')
            ->assertOk()
            ->assertDontSee('cdn.tailwindcss.com', false)
            ->assertSee('/build/assets/site-', false);
        $this->get('/about.html')
            ->assertOk()
            ->assertDontSee('cdn.tailwindcss.com', false)
            ->assertSee('/css/site-custom.css', false);
        $this->assertFileExists(public_path('assets/slider-home/slide-1.webp'));
        $this->assertFileExists(public_path('css/style.css'));
        $this->assertFileExists(public_path('js/gallery.js'));
        $this->get('/not-a-real-page.html')->assertNotFound();
    }

    public function test_uploaded_content_images_are_publicly_available_from_the_media_path(): void
    {
        $path = 'content/tests/content-image.txt';
        Storage::disk('public')->put($path, 'managed content');

        try {
            $this->get("/media/{$path}")
                ->assertOk();
        } finally {
            Storage::disk('public')->delete($path);
        }
    }
}
