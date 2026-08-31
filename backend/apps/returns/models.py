"""Book return model."""
from django.db import models


class Return(models.Model):
    issue = models.OneToOneField("issues.Issue", on_delete=models.PROTECT, related_name="return_record")
    returned_to = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="received_returns"
    )
    return_date = models.DateField(auto_now_add=True)
    condition_notes = models.TextField(blank=True)
    was_late = models.BooleanField(default=False)
    days_late = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Return of {self.issue.book} by {self.issue.student}"
