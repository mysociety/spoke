from itertools import groupby 

from django.forms.models import ModelChoiceIterator, ModelChoiceField

from speeches.tasks import transcribe_speech

"""Common utility functions/classes
Things that are needed by multiple bits of code but are specific enough to
this project not to be in a separate python package"""

def start_transcribing_speech(speech):
    """Kick off a celery task to transcribe a speech"""
    # We only do anything if there's no text already
    if not speech.text:
        # If someone is adding a new audio file and there's already a task
        # We need to clear it
        if speech.celery_task_id:   
            celery.task.control.revoke(speech.celery_task_id)
        # Now we can start a new one
        result = transcribe_speech.delay(speech.id)
        # Finally, we can remember the new task in the model
        speech.celery_task_id = result.task_id
        speech.save()

# From http://djangosnippets.org/snippets/2622/
class GroupedModelChoiceField(ModelChoiceField):
    def __init__(self, queryset, group_by_field, group_label=None, *args, **kwargs):
        """
        group_by_field is the name of a field on the model
        group_label is a function to return a label for each choice group
        """
        super(GroupedModelChoiceField, self).__init__(queryset, *args, **kwargs)
        self.group_by_field = group_by_field
        if group_label is None:
            self.group_label = lambda group: group
        else:
            self.group_label = group_label
    
    def _get_choices(self):
        """
        Exactly as per ModelChoiceField except returns new iterator class
        """
        if hasattr(self, '_choices'):
            return self._choices
        return GroupedModelChoiceIterator(self)
    choices = property(_get_choices, ModelChoiceField._set_choices)

# From http://djangosnippets.org/snippets/2622/
class GroupedModelChoiceIterator(ModelChoiceIterator):
    def __iter__(self):
        if self.field.empty_label is not None:
            yield (u"", self.field.empty_label)
        if self.field.cache_choices:
            if self.field.choice_cache is None:
                self.field.choice_cache = [
                    (self.field.group_label(group), [self.choice(ch) for ch in choices])
                        for group,choices in groupby(self.queryset.all(),
                            key=lambda row: getattr(row, self.field.group_by_field))
                ]
            for choice in self.field.choice_cache:
                yield choice
        else:
            for group, choices in groupby(self.queryset.all(),
                    key=lambda row: getattr(row, self.field.group_by_field)):
                yield (self.field.group_label(group), [self.choice(ch) for ch in choices])