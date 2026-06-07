from django.contrib.sitemaps import Sitemap


class MainSitemap(Sitemap):
    """Robust sitemap that always returns valid URLs.

    Lists the core marketing routes and, when Wagtail is available and a
    site is resolvable, appends published Wagtail pages defensively. The
    previous configuration pointed sitemap.xml at a Wagtail-only sitemap,
    which returned HTTP 500 in production when the page/site tree could not
    be resolved for the request. Wrapping the Wagtail lookup in try/except
    guarantees the sitemap can never 500 the request.
    """

    protocol = "https"
    changefreq = "weekly"
    priority = 0.7

    STATIC_PATHS = [
        "/",
        "/services/",
        "/solutions/",
        "/about/",
        "/insights/",
        "/pricing/",
        "/careers/",
        "/contact/",
        "/validate/",
    ]

    def items(self):
        paths = list(self.STATIC_PATHS)
        try:
            from wagtail.models import Page

            for page in Page.objects.live().public():
                try:
                    url = page.get_url()
                except Exception:
                    url = None
                if url:
                    paths.append(url)
        except Exception:
            # Wagtail unavailable or site not configured — static paths still work.
            pass

        seen = set()
        ordered = []
        for path in paths:
            if path and path not in seen:
                seen.add(path)
                ordered.append(path)
        return ordered

    def location(self, item):
        return item
