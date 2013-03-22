import re
import sys

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic import ListView

from instances.models import Instance

# Admin section
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    # FIXME: these shouldn't be in the instances application, and
    # instead be added via a URLCONF from the projects's settings;
    # adding this here is a temporary measure.
    url(r'^accounts/tokens/?$', 'login_token.views.login_tokens_for_user'),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login'),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout'),
    url(r'^accounts/mobile-login', 'login_token.views.check_login_token'),

    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),

    (r'^', ListView.as_view(
        queryset = Instance.objects.all(),
        context_object_name = 'instances',
        template_name = 'instances/index.html',
    )),
)

urlpatterns += staticfiles_urlpatterns()

# If we're running test, then we need to serve static files even though DEBUG
# is false to prevent lots of 404s. So do what staticfiles_urlpatterns would do.
if 'test' in sys.argv:
    static_url = re.escape(settings.STATIC_URL.lstrip('/'))
    urlpatterns += patterns('',
        url(r'^%s(?P<path>.*)$' % static_url, 'django.views.static.serve', {
            'document_root': settings.STATIC_ROOT,
        }),
        url('^(?P<path>favicon\.ico)$', 'django.views.static.serve', {
            'document_root': settings.STATIC_ROOT,
        }),
    )

