# This is the unfinished start of getting a Select2 tags:... element to work,
# so that you can add new tags within an edit form and have the server add them
# automatically. The client side below works, displaying the tags currently
# associated and allowing editing/adding, but server submission does not yet
# work. TagField needs to add any tags that aren't already present in the
# database.

from itertools import chain

from django import forms
from django.utils.encoding import force_unicode
from django.utils.safestring import mark_safe
from django.forms.util import flatatt

from django_select2.widgets import Select2MultipleWidget

from speeches.models import Tag

class TagWidget(forms.SelectMultiple):
    def render(self, name, value, attrs=None, choices=()):
        if value is None: value = []
        final_attrs = self.build_attrs(attrs, type='text', name=name)

        value = set(force_unicode(v) for v in value)
        selected = []
        all_tags = []
        for option_value, option_label in chain(self.choices, choices):
            option_value = force_unicode(option_value)
            option_label = force_unicode(option_label)
            if option_value in value:
                selected.append( option_label )
            all_tags.append( option_label )

        self.options['tags'] = all_tags
        self.options['width'] = 'resolve'

        if selected:
            final_attrs['value'] = ','.join(selected)
        return mark_safe(u'<input%s />' % flatatt(final_attrs))

class TagWidgetMixin(Select2MultipleWidget, TagWidget):
    pass

class TagField(forms.ModelMultipleChoiceField):
    widget = TagWidgetMixin

    def __init__(self, *args, **kwargs):
        kwargs['required'] = False
        super(TagField, self).__init__(Tag, *args, **kwargs)

    def clean(self, value):
        #if value:
        #    value = [ item.strip() for item in value.split(",") ]
        return super(TagField, self).clean(value)

