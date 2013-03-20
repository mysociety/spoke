import random
import re

from django.contrib.auth.models import User
from django.db import models
from instances.models import InstanceMixin


NUMBER_OF_TOKEN_WORDS = 3

def generate_token():
    def useful_word(w):
        # FIXME: should try to exclude offensive words
        if len(w) < 4:
            return False
        if re.search('^[a-z]*$', w):
            return True
    words = []
    with open('/usr/share/dict/words') as fp:
        for line in fp:
            word = line.strip()
            if useful_word(word):
                words.append(word)
    return " ".join(random.choice(words)
                    for i in range(NUMBER_OF_TOKEN_WORDS))


class LoginToken(InstanceMixin, models.Model):
    '''Represents a readable login token for mobile devices

    To enable logging in to a Spoke instance as a particular user, we
    ask the user to type in a three word phrase; this model records
    tokens that allow login for a particular instance by a particular
    user.'''

    user = models.ForeignKey(User)
    token = models.TextField(max_length=255,
                             default=generate_token)

    def regenerate_token(self):
        token = generate_token()
        token.save()
