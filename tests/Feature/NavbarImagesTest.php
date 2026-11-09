<?php

namespace Tests\Feature;

use App\Enums\AdminRole;
use App\Filament\Resources\NavbarImages\NavbarImageResource;
use App\Filament\Resources\NavbarImages\Pages\EditNavbarImage;
use App\Filament\Resources\NavbarImages\Pages\ListNavbarImages;
use App\Models\NavbarImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class NavbarImagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_slots_retain_originals_and_are_editable_by_cms_roles(): void
    {
        $this->assertSame(14, NavbarImage::count());
        foreach (AdminRole::cases() as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]));
            Livewire::test(ListNavbarImages::class)->assertSuccessful();
        }
        $image = NavbarImage::where('slot', 'solutions')->firstOrFail();
        Livewire::test(EditNavbarImage::class, ['record' => $image->id])->fillForm(['alt_text' => 'Find a suitable battery'])->call('save')->assertHasNoFormErrors();
        $this->assertSame('Find a suitable battery', $image->fresh()->alt_text);
        $this->assertStringEndsWith('/assets/solutions/automotive.webp', $image->image_url);
        $this->assertFalse(NavbarImageResource::canCreate());
        $this->assertFalse(NavbarImageResource::canDelete($image));
    }

    public function test_replacement_and_reset_are_shared_across_public_pages(): void
    {
        Storage::fake('public');
        $path = UploadedFile::fake()->image('nav.png')->store('content/navbar', 'public');
        $image = NavbarImage::where('slot', 'solutions')->firstOrFail();
        $image->update(['image' => $path, 'alt_text' => 'New navbar image']);
        foreach (['/', '/about.html', '/lead-acid', '/solutions/lithium-ion', '/solutions/inverters'] as $url) {
            $this->get($url)->assertOk()->assertSee('navigationImages', false)->assertSee('New navbar image');
        }
        $this->assertSame(Storage::disk('public')->url($path), NavbarImage::forNavigation()['solutions']['url']);
        $image->update(['image' => null]);
        $this->assertStringEndsWith('/assets/solutions/automotive.webp', $image->fresh()->image_url);
    }

    public function test_invalid_files_and_slot_changes_are_rejected(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('content/navbar/bad.png', '<script>bad</script>');
        $image = NavbarImage::firstOrFail();
        try {
            $image->update(['image' => 'content/navbar/bad.png']);
            $this->fail('Invalid image accepted');
        } catch (ValidationException) {
        }
        $this->assertNull($image->fresh()->image);
        $this->expectException(ValidationException::class);
        $image->fresh()->update(['slot' => 'unknown']);
    }

    public function test_inactive_staff_cannot_manage_navbar_images(): void
    {
        $this->actingAs(User::factory()->create(['role' => AdminRole::ContentManager, 'is_active' => false]));
        Livewire::test(ListNavbarImages::class)->assertForbidden();
    }
}
