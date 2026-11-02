<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FrontendRefreshTest extends TestCase
{
    use RefreshDatabase;

    public function test_redesigned_public_pages_are_served_by_laravel_with_compiled_styles(): void
    {
        foreach (['about', 'become-dealer', 'CaAg', 'dealers', 'graphite', 'support', 'vault', 'battery-finder', 'solar-calculator', 'lifepo4', 'careers', 'news', 'faqs', 'privacy-policy', 'checkout', 'quote', 'warranty', 'warranty-claim'] as $page) {
            $this->get("/{$page}.html")->assertOk()
                ->assertDontSee('cdn.tailwindcss.com', false)
                ->assertSee('/build/assets/site-', false)
                ->assertSee('css/nav.css', false);
        }
        $this->get('/not-a-page.html')->assertNotFound();
        // The static ranges use the designer templates; Lead Acid remains CMS-managed.
        $this->get('/solutions/lithium-ion')->assertOk()->assertSee('Lithium-Ion Batteries');
        $this->get('/solutions/inverters')->assertOk()->assertSee('Hybrid Solar Inverters');
        $this->get('/lead-acid')->assertOk()->assertSee('/js/catalog.js', false);
    }

    public function test_public_forms_are_explicit_previews_and_cannot_submit_to_a_legacy_handler(): void
    {
        foreach (['checkout', 'quote', 'warranty', 'warranty-claim', 'support', 'careers', 'become-dealer', 'solar-calculator'] as $page) {
            $this->get("/{$page}.html")->assertOk()
                ->assertSee('data-preview-form', false)
                ->assertSee('/js/form-preview.js', false);
        }
        $this->post('/send-email.php', [])->assertNotFound();
    }
}
