class InstanceFormMixin(object):
    def form_valid(self, form):
        # If not present, fill in the instance from the request
        if not hasattr(form.instance, 'instance'):
            form.instance.instance = self.request.instance
        return super(InstanceFormMixin, self).form_valid(form)

