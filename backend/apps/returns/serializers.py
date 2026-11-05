"""Return serializers."""
from rest_framework import serializers
from .models import Return


class ReturnSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="issue.book.title", read_only=True)
    book_accession = serializers.CharField(source="issue.book.accession_number", read_only=True)
    student_name = serializers.CharField(source="issue.student.user.full_name", read_only=True)
    student_enrollment = serializers.CharField(source="issue.student.enrollment_number", read_only=True)
    returned_to_name = serializers.CharField(source="returned_to.full_name", read_only=True)

    class Meta:
        model = Return
        fields = [
            "id", "issue",
            "book_title", "book_accession",
            "student_name", "student_enrollment",
            "returned_to", "returned_to_name",
            "return_date", "condition_notes", "was_late", "days_late",
        ]
        read_only_fields = ["id", "return_date"]


class ReturnProcessSerializer(serializers.Serializer):
    """Input for processing a return — accept by issue_id OR by accession+enrollment."""
    issue_id = serializers.IntegerField(required=False)
    accession = serializers.CharField(required=False)
    student_enrollment = serializers.CharField(required=False)
    condition_notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, data):
        if not data.get("issue_id") and not (data.get("accession") and data.get("student_enrollment")):
            raise serializers.ValidationError(
                "Provide either 'issue_id' OR both 'accession' and 'student_enrollment'."
            )
        return data

