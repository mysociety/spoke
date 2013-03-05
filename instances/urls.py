import re
import sys

from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic import ListView

from instances.models import Instance

urlpatterns = patterns('',
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

