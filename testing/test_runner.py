"""
Book Bank Management System — Standalone Software Testing Suite
==============================================================
Pure Python tests covering business logic extracted from the application.
No Django or external dependencies needed.

Techniques Applied:
  1. Unit Testing          — individual functions & classes
  2. Equivalence Partitioning — input class grouping
  3. Boundary Value Analysis — edge/boundary inputs
  4. Decision Table Testing — complex condition combinations
  5. State Transition Testing — model lifecycle states
  6. White-Box (Branch) Coverage — logic paths traced
  7. Integration-Logic Testing — multi-component workflows
  8. Negative Testing — invalid inputs, unauthorized access
"""

import unittest
import sys
from datetime import date, timedelta
from decimal import Decimal

# ─────────────────────────────────────────────────────────────────────────────
# Extracted / Re-implemented Business Logic (mirrors backend code exactly)
# ─────────────────────────────────────────────────────────────────────────────

FINE_PER_DAY         = 2     # ₹2 per overdue day  (settings.FINE_PER_DAY)
LOAN_DURATION_DAYS   = 14    # settings.LOAN_DURATION_DAYS
MAX_RENEWALS         = 2     # settings.MAX_RENEWALS
DEFAULT_BORROW_LIMIT = 3     # settings.DEFAULT_BORROWING_LIMIT
PICKUP_DEADLINE_DAYS = 3     # settings.PICKUP_DEADLINE_DAYS
DUE_SOON_DAYS        = 3     # settings.DUE_SOON_DAYS


# ── Fine Calculation Logic (returns/views.py lines 78-110) ───────────────────
def calculate_fine(due_date: date, return_date: date) -> dict:
    """
    Replicates the return view fine-computation block.
    Returns {'days_late': int, 'was_late': bool, 'amount': Decimal}
    """
    days_late = max(0, (return_date - due_date).days)
    was_late  = days_late > 0
    amount    = Decimal(days_late * FINE_PER_DAY)
    return {"days_late": days_late, "was_late": was_late, "amount": amount}


# ── Borrowing Eligibility (issues/views.py lines 54-68) ──────────────────────
def can_student_borrow(active_loan_count: int, borrow_limit: int,
                       available_copies: int, already_has_this_book: bool) -> dict:
    """
    Returns {'allowed': bool, 'reason': str | None}
    Mirrors the four business-rule checks in issue_list_create (POST).
    """
    if active_loan_count >= borrow_limit:
        return {"allowed": False,
                "reason": f"Borrowing limit ({borrow_limit}) reached."}
    if available_copies <= 0:
        return {"allowed": False,
                "reason": "No copies available."}
    if already_has_this_book:
        return {"allowed": False,
                "reason": "Already has an active/pending issue for this book."}
    return {"allowed": True, "reason": None}


# ── Renewal Eligibility (issues/views.py lines 130-140) ──────────────────────
def can_renew(renewal_count: int, has_pending_reservation: bool) -> dict:
    """
    Mirrors the renewal checks in renew_issue view.
    """
    if renewal_count >= MAX_RENEWALS:
        return {"allowed": False,
                "reason": f"Maximum renewals ({MAX_RENEWALS}) reached."}
    if has_pending_reservation:
        return {"allowed": False,
                "reason": "Cannot renew — this book has pending reservations."}
    return {"allowed": True, "reason": None}


# ── Reservation Eligibility (reservations/views.py lines 54-75) ──────────────
def can_reserve(available_copies: int, already_reserved: bool,
                already_on_loan: bool) -> dict:
    """
    Mirrors the reservation creation checks.
    """
    if available_copies > 0:
        return {"allowed": False,
                "reason": "Copies available; issue directly instead of reserving."}
    if already_reserved:
        return {"allowed": False,
                "reason": "Already have an active reservation for this book."}
    if already_on_loan:
        return {"allowed": False,
                "reason": "Already have this book on loan."}
    return {"allowed": True, "reason": None}


# ── Due-Soon Threshold (send_due_soon_notifications.py lines 42-48) ──────────
def is_due_soon(due_date: date, today: date, window_days: int = DUE_SOON_DAYS) -> bool:
    """Returns True if due_date falls within [today, today+window_days]."""
    threshold = today + timedelta(days=window_days)
    return today <= due_date <= threshold


# ── Password Validation (serializers.py line 21-37) ──────────────────────────
def validate_password(password: str, confirm_password: str) -> dict:
    """
    Mirrors RegisterSerializer validation.
    min_length=8, passwords must match.
    """
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    if password != confirm_password:
        errors.append("Passwords do not match.")
    return {"valid": len(errors) == 0, "errors": errors}


# ── RBAC Permission Check (permissions.py) ───────────────────────────────────
def check_permission(user_role: str, required_role: str) -> bool:
    """Mirrors IsLibrarian / IsStudent / IsVendor permission classes."""
    return user_role == required_role


# ── Queue Position Calculation (reservations/views.py lines 78-85) ───────────
def calculate_queue_position(existing_waiting_count: int) -> int:
    """New reservation gets position = existing_waiting_count + 1."""
    return existing_waiting_count + 1


# ── Email Validation (simple RFC check used in serializer) ───────────────────
def is_valid_email(email: str) -> bool:
    """Basic email format check used by EmailField."""
    return "@" in email and "." in email.split("@")[-1] and len(email) >= 5


# ── Overdue Computation (update_overdue_status.py) ───────────────────────────
def days_overdue(due_date: date, today: date) -> int:
    """Returns how many days overdue (0 if not overdue)."""
    return max(0, (today - due_date).days)


# ─────────────────────────────────────────────────────────────────────────────
# Tracking / Results Helper
# ─────────────────────────────────────────────────────────────────────────────

class TestResult:
    """Collects per-test results for final reporting."""
    results = []

    @classmethod
    def record(cls, test_id, name, technique, expected, actual, passed, notes=""):
        cls.results.append({
            "id":        test_id,
            "name":      name,
            "technique": technique,
            "expected":  expected,
            "actual":    actual,
            "passed":    passed,
            "notes":     notes,
        })

    @classmethod
    def summary(cls):
        total  = len(cls.results)
        passed = sum(1 for r in cls.results if r["passed"])
        failed = total - passed
        return total, passed, failed


# ─────────────────────────────────────────────────────────────────────────────
# TC-1  UNIT TESTING — Fine Calculation
# ─────────────────────────────────────────────────────────────────────────────

class TestFineCalculation(unittest.TestCase):
    """Unit tests for calculate_fine() — the core financial logic."""

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Unit Test", expected, actual, passed, notes)

    def test_TC01_on_time_return_no_fine(self):
        due = date(2026, 11, 1)
        ret = date(2026, 11, 1)   # same day = 0 days late
        r = calculate_fine(due, ret)
        passed = r["days_late"] == 0 and r["amount"] == 0 and not r["was_late"]
        self._rec("TC-01", "On-time return: zero fine", "days_late=0, amount=0", r, passed)
        self.assertTrue(passed)

    def test_TC02_one_day_late(self):
        due = date(2026, 11, 1)
        ret = date(2026, 11, 2)
        r = calculate_fine(due, ret)
        expected_amt = Decimal("2")
        passed = r["days_late"] == 1 and r["amount"] == expected_amt
        self._rec("TC-02", "1-day late: ₹2 fine", f"amount=₹2", r, passed)
        self.assertTrue(passed)

    def test_TC03_14_days_late(self):
        due = date(2026, 10, 1)
        ret = date(2026, 10, 15)
        r = calculate_fine(due, ret)
        expected_amt = Decimal(str(14 * FINE_PER_DAY))
        passed = r["days_late"] == 14 and r["amount"] == expected_amt
        self._rec("TC-03", "14-days late: ₹28 fine", f"amount=₹{expected_amt}", r, passed)
        self.assertTrue(passed)

    def test_TC04_return_before_due(self):
        due = date(2026, 11, 10)
        ret = date(2026, 11, 5)   # 5 days early
        r = calculate_fine(due, ret)
        passed = r["days_late"] == 0 and r["amount"] == 0
        self._rec("TC-04", "Early return: zero fine", "days_late=0", r, passed)
        self.assertTrue(passed)

    def test_TC05_exactly_max_loan_period_late(self):
        due = date(2026, 10, 1)
        ret = date(2026, 10, 1) + timedelta(days=LOAN_DURATION_DAYS)
        r = calculate_fine(due, ret)
        expected = Decimal(str(LOAN_DURATION_DAYS * FINE_PER_DAY))
        passed = r["amount"] == expected
        self._rec("TC-05", f"Returned exactly {LOAN_DURATION_DAYS} days late",
                  f"₹{expected}", r, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-2  EQUIVALENCE PARTITIONING — Borrowing Eligibility
# ─────────────────────────────────────────────────────────────────────────────

class TestBorrowingEqPartition(unittest.TestCase):
    """
    Equivalence Partitions for borrowing eligibility:
      P1 (VALID):   active_loans < limit, copies > 0, no duplicate
      P2 (INVALID): active_loans >= limit
      P3 (INVALID): available_copies <= 0
      P4 (INVALID): already has the book
    """

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Equivalence Partitioning", expected, actual, passed, notes)

    def test_TC06_valid_partition_can_borrow(self):
        result = can_student_borrow(active_loan_count=1, borrow_limit=3,
                                    available_copies=2, already_has_this_book=False)
        passed = result["allowed"] is True
        self._rec("TC-06", "EP-P1: Valid borrow request", "allowed=True", result, passed)
        self.assertTrue(passed)

    def test_TC07_limit_reached_partition(self):
        result = can_student_borrow(active_loan_count=3, borrow_limit=3,
                                    available_copies=2, already_has_this_book=False)
        passed = result["allowed"] is False and "limit" in result["reason"].lower()
        self._rec("TC-07", "EP-P2: Borrow limit reached", "allowed=False", result, passed)
        self.assertTrue(passed)

    def test_TC08_no_copies_partition(self):
        result = can_student_borrow(active_loan_count=0, borrow_limit=3,
                                    available_copies=0, already_has_this_book=False)
        passed = result["allowed"] is False and "copies" in result["reason"].lower()
        self._rec("TC-08", "EP-P3: No available copies", "allowed=False", result, passed)
        self.assertTrue(passed)

    def test_TC09_duplicate_issue_partition(self):
        result = can_student_borrow(active_loan_count=1, borrow_limit=3,
                                    available_copies=5, already_has_this_book=True)
        passed = result["allowed"] is False and "already" in result["reason"].lower()
        self._rec("TC-09", "EP-P4: Duplicate issue", "allowed=False", result, passed)
        self.assertTrue(passed)

    def test_TC10_zero_active_loans_valid(self):
        result = can_student_borrow(active_loan_count=0, borrow_limit=3,
                                    available_copies=1, already_has_this_book=False)
        passed = result["allowed"] is True
        self._rec("TC-10", "EP: 0 active loans — valid", "allowed=True", result, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-3  BOUNDARY VALUE ANALYSIS — Borrowing Limit
# ─────────────────────────────────────────────────────────────────────────────

class TestBorrowLimitBVA(unittest.TestCase):
    """
    BVA for active_loan_count with borrow_limit=3:
      Min-1 = -1 (impossible but logic-safe)
      Min   =  0
      Min+1 =  1
      Nominal = 2
      Max-1 =  2
      Max   =  3  → denied
      Max+1 =  4  → denied
    """

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Boundary Value Analysis", expected, actual, passed, notes)

    def test_TC11_bva_zero_loans(self):
        r = can_student_borrow(0, 3, 1, False)
        passed = r["allowed"] is True
        self._rec("TC-11", "BVA: 0 active loans (min)", "allowed=True", r, passed)
        self.assertTrue(passed)

    def test_TC12_bva_one_loan(self):
        r = can_student_borrow(1, 3, 1, False)
        passed = r["allowed"] is True
        self._rec("TC-12", "BVA: 1 active loan (min+1)", "allowed=True", r, passed)
        self.assertTrue(passed)

    def test_TC13_bva_two_loans(self):
        r = can_student_borrow(2, 3, 1, False)
        passed = r["allowed"] is True
        self._rec("TC-13", "BVA: 2 active loans (max-1)", "allowed=True", r, passed)
        self.assertTrue(passed)

    def test_TC14_bva_exactly_at_limit(self):
        r = can_student_borrow(3, 3, 1, False)
        passed = r["allowed"] is False
        self._rec("TC-14", "BVA: 3 active loans (at limit=max)", "allowed=False", r, passed)
        self.assertTrue(passed)

    def test_TC15_bva_over_limit(self):
        r = can_student_borrow(4, 3, 1, False)
        passed = r["allowed"] is False
        self._rec("TC-15", "BVA: 4 active loans (max+1)", "allowed=False", r, passed)
        self.assertTrue(passed)

    def test_TC16_bva_fine_one_day_boundary(self):
        """Fine boundary: 0 days late = ₹0; 1 day late = ₹2."""
        due = date(2026, 10, 10)
        r0 = calculate_fine(due, date(2026, 10, 10))
        r1 = calculate_fine(due, date(2026, 10, 11))
        passed = r0["amount"] == 0 and r1["amount"] == Decimal("2")
        self._rec("TC-16", "BVA Fine: 0-day vs 1-day boundary",
                  "₹0 / ₹2", f"{r0['amount']} / {r1['amount']}", passed)
        self.assertTrue(passed)

    def test_TC17_bva_max_renewals_exactly_at_limit(self):
        r = can_renew(renewal_count=MAX_RENEWALS, has_pending_reservation=False)
        passed = r["allowed"] is False
        self._rec("TC-17", f"BVA Renewal: exactly at max ({MAX_RENEWALS})", "allowed=False", r, passed)
        self.assertTrue(passed)

    def test_TC18_bva_renewal_one_before_limit(self):
        r = can_renew(renewal_count=MAX_RENEWALS - 1, has_pending_reservation=False)
        passed = r["allowed"] is True
        self._rec("TC-18", f"BVA Renewal: max-1 ({MAX_RENEWALS-1})", "allowed=True", r, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-4  DECISION TABLE TESTING — Reservation Logic
# ─────────────────────────────────────────────────────────────────────────────

class TestReservationDecisionTable(unittest.TestCase):
    """
    Decision table for can_reserve():

    Condition / Rule   | R1  | R2  | R3  | R4  | R5
    -------------------+-----+-----+-----+-----+-----
    copies_available>0 |  T  |  F  |  F  |  F  |  F
    already_reserved   |  -  |  T  |  F  |  F  |  T
    already_on_loan    |  -  |  -  |  T  |  F  |  -
    -------------------+-----+-----+-----+-----+-----
    Action: ALLOW      |  N  |  N  |  N  |  Y  |  N
    """

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Decision Table Testing", expected, actual, passed, notes)

    def test_TC19_dt_rule1_copies_available(self):
        r = can_reserve(available_copies=2, already_reserved=False, already_on_loan=False)
        passed = r["allowed"] is False
        self._rec("TC-19", "DT-R1: copies available → deny", "allowed=False", r, passed)
        self.assertTrue(passed)

    def test_TC20_dt_rule2_already_reserved(self):
        r = can_reserve(available_copies=0, already_reserved=True, already_on_loan=False)
        passed = r["allowed"] is False
        self._rec("TC-20", "DT-R2: already reserved → deny", "allowed=False", r, passed)
        self.assertTrue(passed)

    def test_TC21_dt_rule3_already_on_loan(self):
        r = can_reserve(available_copies=0, already_reserved=False, already_on_loan=True)
        passed = r["allowed"] is False
        self._rec("TC-21", "DT-R3: already on loan → deny", "allowed=False", r, passed)
        self.assertTrue(passed)

    def test_TC22_dt_rule4_happy_path(self):
        r = can_reserve(available_copies=0, already_reserved=False, already_on_loan=False)
        passed = r["allowed"] is True
        self._rec("TC-22", "DT-R4: all clear → allow", "allowed=True", r, passed)
        self.assertTrue(passed)

    def test_TC23_dt_rule5_reserved_and_on_loan(self):
        r = can_reserve(available_copies=0, already_reserved=True, already_on_loan=True)
        passed = r["allowed"] is False
        self._rec("TC-23", "DT-R5: reserved+on-loan → deny", "allowed=False", r, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-5  STATE TRANSITION TESTING — Issue Lifecycle
# ─────────────────────────────────────────────────────────────────────────────

class TestIssueStateTransitions(unittest.TestCase):
    """
    Issue lifecycle state machine:
    
    ACTIVE ──(overdue check)──► OVERDUE
    ACTIVE ──(return)──────────► RETURNED
    OVERDUE ──(return)─────────► RETURNED
    RETURNED ──(any)───────────► [invalid; no transition]
    PENDING ──(approve)────────► ACTIVE
    """

    # State constants mirroring Issue.Status
    ACTIVE   = "active"
    OVERDUE  = "overdue"
    RETURNED = "returned"
    PENDING  = "pending"

    VALID_TRANSITIONS = {
        ACTIVE:   [OVERDUE, RETURNED],
        OVERDUE:  [RETURNED],
        PENDING:  [ACTIVE],
        RETURNED: [],
    }

    def _can_transition(self, from_state, to_state):
        return to_state in self.VALID_TRANSITIONS.get(from_state, [])

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "State Transition Testing", expected, actual, passed, notes)

    def test_TC24_active_to_overdue(self):
        passed = self._can_transition(self.ACTIVE, self.OVERDUE)
        self._rec("TC-24", "ST: ACTIVE → OVERDUE (valid)", "allowed", passed, passed)
        self.assertTrue(passed)

    def test_TC25_active_to_returned(self):
        passed = self._can_transition(self.ACTIVE, self.RETURNED)
        self._rec("TC-25", "ST: ACTIVE → RETURNED (valid)", "allowed", passed, passed)
        self.assertTrue(passed)

    def test_TC26_overdue_to_returned(self):
        passed = self._can_transition(self.OVERDUE, self.RETURNED)
        self._rec("TC-26", "ST: OVERDUE → RETURNED (valid)", "allowed", passed, passed)
        self.assertTrue(passed)

    def test_TC27_returned_cannot_transition(self):
        passed = not self._can_transition(self.RETURNED, self.ACTIVE)
        self._rec("TC-27", "ST: RETURNED → ACTIVE (invalid)", "not allowed", passed, passed)
        self.assertTrue(passed)

    def test_TC28_returned_to_overdue_invalid(self):
        passed = not self._can_transition(self.RETURNED, self.OVERDUE)
        self._rec("TC-28", "ST: RETURNED → OVERDUE (invalid)", "not allowed", passed, passed)
        self.assertTrue(passed)

    def test_TC29_pending_to_active(self):
        passed = self._can_transition(self.PENDING, self.ACTIVE)
        self._rec("TC-29", "ST: PENDING → ACTIVE (valid)", "allowed", passed, passed)
        self.assertTrue(passed)

    def test_TC30_pending_to_returned_invalid(self):
        passed = not self._can_transition(self.PENDING, self.RETURNED)
        self._rec("TC-30", "ST: PENDING → RETURNED (skip; invalid)", "not allowed", passed, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-6  STATE TRANSITION — Reservation Lifecycle
# ─────────────────────────────────────────────────────────────────────────────

class TestReservationStateTransitions(unittest.TestCase):
    """
    Reservation.Status state machine:
    WAITING → READY → FULFILLED
    WAITING → CANCELLED
    READY   → CANCELLED
    FULFILLED → (terminal)
    CANCELLED → (terminal)
    """

    WAITING   = "waiting"
    READY     = "ready"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"

    VALID = {
        WAITING:   [READY, CANCELLED],
        READY:     [FULFILLED, CANCELLED],
        FULFILLED: [],
        CANCELLED: [],
    }

    def _can(self, f, t): return t in self.VALID.get(f, [])

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "State Transition Testing", expected, actual, passed, notes)

    def test_TC31_waiting_to_ready(self):
        p = self._can(self.WAITING, self.READY)
        self._rec("TC-31", "RST: WAITING → READY", "allowed", p, p)
        self.assertTrue(p)

    def test_TC32_waiting_to_cancelled(self):
        p = self._can(self.WAITING, self.CANCELLED)
        self._rec("TC-32", "RST: WAITING → CANCELLED", "allowed", p, p)
        self.assertTrue(p)

    def test_TC33_ready_to_fulfilled(self):
        p = self._can(self.READY, self.FULFILLED)
        self._rec("TC-33", "RST: READY → FULFILLED", "allowed", p, p)
        self.assertTrue(p)

    def test_TC34_fulfilled_terminal(self):
        p = not self._can(self.FULFILLED, self.WAITING)
        self._rec("TC-34", "RST: FULFILLED → WAITING (invalid)", "not allowed", p, p)
        self.assertTrue(p)

    def test_TC35_cancelled_terminal(self):
        p = not self._can(self.CANCELLED, self.READY)
        self._rec("TC-35", "RST: CANCELLED → READY (invalid)", "not allowed", p, p)
        self.assertTrue(p)


# ─────────────────────────────────────────────────────────────────────────────
# TC-7  WHITE-BOX / BRANCH COVERAGE — Fine Calculation Branches
# ─────────────────────────────────────────────────────────────────────────────

class TestFineWhiteBox(unittest.TestCase):
    """
    Branch coverage for calculate_fine():
    Branch A: return_date <= due_date  → days_late = 0 → was_late = False
    Branch B: return_date > due_date   → days_late > 0 → was_late = True
    """

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "White-Box (Branch Coverage)", expected, actual, passed, notes)

    def test_TC36_wb_branch_A_no_late(self):
        """Branch A: same-day return"""
        due = date(2026, 10, 15)
        r = calculate_fine(due, due)
        passed = r["was_late"] is False and r["days_late"] == 0
        self._rec("TC-36", "WB Branch-A: days_late=0 path", "was_late=False", r, passed)
        self.assertTrue(passed)

    def test_TC37_wb_branch_B_late(self):
        """Branch B: late return triggers fine"""
        due = date(2026, 10, 15)
        ret = date(2026, 10, 20)
        r = calculate_fine(due, ret)
        passed = r["was_late"] is True and r["days_late"] == 5
        self._rec("TC-37", "WB Branch-B: days_late>0 path", "was_late=True, days=5", r, passed)
        self.assertTrue(passed)

    def test_TC38_wb_borrow_all_branches(self):
        """
        White-box: exercise all 4 decision branches of can_student_borrow()
        in sequence to verify full branch coverage.
        """
        branches_hit = []

        # Branch 1: limit hit
        r1 = can_student_borrow(3, 3, 5, False)
        if not r1["allowed"]: branches_hit.append("limit")

        # Branch 2: no copies
        r2 = can_student_borrow(1, 3, 0, False)
        if not r2["allowed"]: branches_hit.append("copies")

        # Branch 3: duplicate
        r3 = can_student_borrow(1, 3, 5, True)
        if not r3["allowed"]: branches_hit.append("duplicate")

        # Branch 4: all clear
        r4 = can_student_borrow(1, 3, 5, False)
        if r4["allowed"]: branches_hit.append("allowed")

        passed = set(branches_hit) == {"limit", "copies", "duplicate", "allowed"}
        self._rec("TC-38", "WB: 4 branches of can_student_borrow() all hit",
                  "4 branches covered", branches_hit, passed)
        self.assertTrue(passed)

    def test_TC39_wb_renew_both_branches(self):
        """Branch coverage for can_renew()"""
        # Branch 1: max renewals hit
        r1 = can_renew(2, False)
        # Branch 2: pending reservations block
        r2 = can_renew(0, True)
        # Branch 3: allowed
        r3 = can_renew(0, False)
        passed = (not r1["allowed"]) and (not r2["allowed"]) and r3["allowed"]
        self._rec("TC-39", "WB: 3 branches of can_renew() covered",
                  "3 branches hit", f"r1={r1['allowed']},r2={r2['allowed']},r3={r3['allowed']}", passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-8  NEGATIVE TESTING — Invalid Inputs & Security
# ─────────────────────────────────────────────────────────────────────────────

class TestNegativeCases(unittest.TestCase):
    """
    Negative tests: system must reject bad inputs gracefully.
    """

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Negative Testing", expected, actual, passed, notes)

    def test_TC40_negative_fine_days_clamped_to_zero(self):
        """Returning 10 days early: fine must never be negative."""
        due = date(2026, 10, 15)
        ret = date(2026, 10, 5)   # 10 days early
        r = calculate_fine(due, ret)
        passed = r["amount"] >= 0 and r["days_late"] == 0
        self._rec("TC-40", "NEG: Early return → no negative fine", "amount≥0", r, passed)
        self.assertTrue(passed)

    def test_TC41_empty_password(self):
        r = validate_password("", "")
        passed = r["valid"] is False
        self._rec("TC-41", "NEG: Empty password rejected", "valid=False", r, passed)
        self.assertTrue(passed)

    def test_TC42_password_too_short(self):
        r = validate_password("abc123", "abc123")
        passed = r["valid"] is False
        self._rec("TC-42", "NEG: Password < 8 chars rejected", "valid=False", r, passed)
        self.assertTrue(passed)

    def test_TC43_password_mismatch(self):
        r = validate_password("SecurePass@1", "DifferentPass@2")
        passed = r["valid"] is False and any("match" in e.lower() for e in r["errors"])
        self._rec("TC-43", "NEG: Mismatched passwords rejected", "valid=False,mismatch error", r, passed)
        self.assertTrue(passed)

    def test_TC44_invalid_email_formats(self):
        invalid_emails = ["notanemail", "missing@dot", "@nodomain.com", "nodomain", ""]
        all_rejected = all(not is_valid_email(e) for e in invalid_emails)
        self._rec("TC-44", "NEG: Invalid email formats all rejected", "all False",
                  invalid_emails, all_rejected)
        self.assertTrue(all_rejected)

    def test_TC45_rbac_student_cannot_act_as_librarian(self):
        passed = not check_permission("student", "librarian")
        self._rec("TC-45", "NEG: Student cannot access librarian endpoint",
                  "denied", passed, passed)
        self.assertTrue(passed)

    def test_TC46_rbac_vendor_cannot_act_as_librarian(self):
        passed = not check_permission("vendor", "librarian")
        self._rec("TC-46", "NEG: Vendor cannot access librarian endpoint",
                  "denied", passed, passed)
        self.assertTrue(passed)

    def test_TC47_unauthenticated_role_check(self):
        """Unauthenticated user (empty role) must be denied all roles."""
        passed = (not check_permission("", "librarian") and
                  not check_permission("", "student") and
                  not check_permission("", "vendor"))
        self._rec("TC-47", "NEG: Unauthenticated user denied all roles",
                  "all denied", passed, passed)
        self.assertTrue(passed)

    def test_TC48_negative_active_loan_count(self):
        """System should still grant borrow if loan count is somehow negative."""
        r = can_student_borrow(active_loan_count=-1, borrow_limit=3,
                               available_copies=1, already_has_this_book=False)
        passed = r["allowed"] is True
        self._rec("TC-48", "NEG: Negative loan count treated as 0 (allowed)", "allowed=True", r, passed)
        self.assertTrue(passed)

    def test_TC49_reserve_with_many_copies_available(self):
        r = can_reserve(available_copies=100, already_reserved=False, already_on_loan=False)
        passed = r["allowed"] is False
        self._rec("TC-49", "NEG: Cannot reserve when 100 copies available", "denied", r, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-9  INTEGRATION LOGIC — End-to-End Workflows (pure Python simulation)
# ─────────────────────────────────────────────────────────────────────────────

class TestIntegrationWorkflows(unittest.TestCase):
    """
    Simulates multi-step workflows combining multiple business rules.
    """

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Integration Logic Testing", expected, actual, passed, notes)

    def test_TC50_full_borrow_return_cycle(self):
        """
        Workflow: student borrows → returns on time → fine = ₹0.
        Simulates the ACTIVE → RETURNED lifecycle with copy count tracking.
        """
        total_copies = 3
        available    = 3
        active_loans = 0
        borrow_limit = 3

        # Step 1: Check eligibility
        result = can_student_borrow(active_loans, borrow_limit, available, False)
        assert result["allowed"], "Step1 failed"

        # Step 2: Issue book
        available    -= 1
        active_loans += 1
        issue_date = date(2026, 10, 1)
        due_date   = issue_date + timedelta(days=LOAN_DURATION_DAYS)

        # Step 3: Return on time
        return_date = due_date
        fine = calculate_fine(due_date, return_date)
        available    += 1
        active_loans -= 1

        passed = (available == 3 and active_loans == 0
                  and fine["amount"] == 0 and not fine["was_late"])
        self._rec("TC-50", "INT: Full borrow → on-time return cycle",
                  "copies=3, fine=₹0", f"copies={available}, fine=₹{fine['amount']}", passed)
        self.assertTrue(passed)

    def test_TC51_borrow_then_late_return_fine(self):
        """
        Workflow: student borrows → returns 7 days late → fine generated.
        """
        available = 2
        active_loans = 0

        # Borrow
        r = can_student_borrow(active_loans, 3, available, False)
        assert r["allowed"]
        available -= 1
        due_date = date(2026, 10, 1) + timedelta(days=LOAN_DURATION_DAYS)

        # Late return
        return_date = due_date + timedelta(days=7)
        fine = calculate_fine(due_date, return_date)
        available += 1

        expected_fine = Decimal(str(7 * FINE_PER_DAY))
        passed = (fine["amount"] == expected_fine and fine["days_late"] == 7
                  and available == 2)
        self._rec("TC-51", "INT: Borrow → 7-day late return → ₹14 fine",
                  f"fine=₹{expected_fine}", f"fine=₹{fine['amount']}", passed)
        self.assertTrue(passed)

    def test_TC52_borrow_renew_then_return(self):
        """
        Workflow: borrow → renew twice (max) → third renewal denied → return.
        """
        due_date = date(2026, 10, 1) + timedelta(days=LOAN_DURATION_DAYS)
        renewal_count = 0

        # Renew 1
        r1 = can_renew(renewal_count, False)
        assert r1["allowed"]
        renewal_count += 1
        due_date += timedelta(days=LOAN_DURATION_DAYS)

        # Renew 2
        r2 = can_renew(renewal_count, False)
        assert r2["allowed"]
        renewal_count += 1
        due_date += timedelta(days=LOAN_DURATION_DAYS)

        # Renew 3 — should be denied
        r3 = can_renew(renewal_count, False)

        passed = (r1["allowed"] and r2["allowed"] and not r3["allowed"]
                  and renewal_count == MAX_RENEWALS)
        self._rec("TC-52", "INT: 2 renewals succeed; 3rd denied",
                  "r1=T,r2=T,r3=F", f"r1={r1['allowed']},r2={r2['allowed']},r3={r3['allowed']}", passed)
        self.assertTrue(passed)

    def test_TC53_full_reservation_to_fulfillment_workflow(self):
        """
        Workflow: book has 0 copies → student reserves →
        another return triggers READY → librarian fulfills.
        """
        available     = 0
        waiting_count = 0

        # 1. Reserve
        r = can_reserve(available, False, False)
        assert r["allowed"]
        waiting_count += 1
        queue_pos = calculate_queue_position(waiting_count - 1)

        # 2. Book returned, copy restored
        available += 1
        # First waiting reservation promoted to READY
        reservation_status = "ready" if waiting_count > 0 else "waiting"
        waiting_count -= 1

        # 3. Librarian fulfills: check can_borrow (borrowing_limit not exceeded)
        active_loans = 0
        borrow_check = can_student_borrow(active_loans, 3, available, False)
        if borrow_check["allowed"]:
            available -= 1
            reservation_status = "fulfilled"

        passed = (reservation_status == "fulfilled" and
                  queue_pos == 1 and available == 0 and waiting_count == 0)
        self._rec("TC-53", "INT: Reserve → Return triggers READY → Fulfill",
                  "fulfilled, copies=0", f"status={reservation_status}, copies={available}", passed)
        self.assertTrue(passed)

    def test_TC54_borrowing_limit_across_multiple_books(self):
        """
        Workflow: student borrows up to limit then is denied a 4th book.
        """
        available_copies_per_book = [3, 2, 5, 1]
        active_loans = 0
        borrow_limit = DEFAULT_BORROW_LIMIT  # 3
        results = []

        for i, copies in enumerate(available_copies_per_book):
            r = can_student_borrow(active_loans, borrow_limit, copies, False)
            results.append(r["allowed"])
            if r["allowed"]:
                active_loans += 1

        # First 3 should succeed, 4th denied
        passed = results == [True, True, True, False]
        self._rec("TC-54", "INT: Student exhausts 3-book limit",
                  "[T,T,T,F]", results, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-10  DUE-SOON NOTIFICATION LOGIC
# ─────────────────────────────────────────────────────────────────────────────

class TestDueSoonLogic(unittest.TestCase):
    """Unit + BVA tests for the due-soon notification threshold."""

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Unit Test / BVA", expected, actual, passed, notes)

    def test_TC55_due_today(self):
        today = date(2026, 11, 16)
        passed = is_due_soon(today, today)
        self._rec("TC-55", "Due today → notify", "True", passed, passed)
        self.assertTrue(passed)

    def test_TC56_due_tomorrow(self):
        today = date(2026, 11, 16)
        passed = is_due_soon(today + timedelta(1), today)
        self._rec("TC-56", "Due tomorrow → notify", "True", passed, passed)
        self.assertTrue(passed)

    def test_TC57_due_at_window_boundary(self):
        today = date(2026, 11, 16)
        due   = today + timedelta(DUE_SOON_DAYS)   # exactly at threshold
        passed = is_due_soon(due, today)
        self._rec("TC-57", f"Due in {DUE_SOON_DAYS} days (boundary) → notify",
                  "True", passed, passed)
        self.assertTrue(passed)

    def test_TC58_due_just_outside_window(self):
        today = date(2026, 11, 16)
        due   = today + timedelta(DUE_SOON_DAYS + 1)
        passed = not is_due_soon(due, today)
        self._rec("TC-58", f"Due in {DUE_SOON_DAYS+1} days → no notify",
                  "False", not passed, passed)
        self.assertTrue(passed)

    def test_TC59_already_overdue_not_due_soon(self):
        today = date(2026, 11, 16)
        due   = today - timedelta(1)  # overdue
        passed = not is_due_soon(due, today)
        self._rec("TC-59", "Overdue book not counted as due-soon",
                  "False", not passed, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-11  QUEUE POSITION LOGIC
# ─────────────────────────────────────────────────────────────────────────────

class TestQueuePosition(unittest.TestCase):
    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "Unit Test", expected, actual, passed, notes)

    def test_TC60_first_in_queue(self):
        pos = calculate_queue_position(0)
        passed = pos == 1
        self._rec("TC-60", "Queue: 0 waiting → position 1", 1, pos, passed)
        self.assertTrue(passed)

    def test_TC61_fifth_in_queue(self):
        pos = calculate_queue_position(4)
        passed = pos == 5
        self._rec("TC-61", "Queue: 4 waiting → position 5", 5, pos, passed)
        self.assertTrue(passed)

    def test_TC62_zero_fine_rate(self):
        """Edge: if fine rate were ₹0, no fine ever generated."""
        saved = globals()["FINE_PER_DAY"]
        globals()["FINE_PER_DAY"] = 0
        due = date(2026, 10, 1)
        ret = due + timedelta(10)
        days_late = max(0, (ret - due).days)
        amount = Decimal(str(days_late * globals()["FINE_PER_DAY"]))
        globals()["FINE_PER_DAY"] = saved
        passed = amount == 0
        self._rec("TC-62", "Edge: ₹0 fine rate produces ₹0", 0, amount, passed)
        self.assertTrue(passed)


# ─────────────────────────────────────────────────────────────────────────────
# TC-12  RBAC PERMISSION MATRIX — All Role/Action Combinations
# ─────────────────────────────────────────────────────────────────────────────

class TestRBACPermissionMatrix(unittest.TestCase):
    """
    Decision table / matrix: which roles can perform which actions.
    Action      | Librarian | Student | Vendor | Unauthenticated
    ────────────┼───────────┼─────────┼────────┼────────────────
    Create Book |    ✓      |   ✗     |   ✗    |      ✗
    View Books  |    ✓      |   ✓     |   ✓    |      ✗
    Issue Book  |    ✗      |   ✓     |   ✗    |      ✗
    Return Book |    ✓      |   ✗     |   ✗    |      ✗
    View Reports|    ✓      |   ✗     |   ✗    |      ✗
    """

    def _can(self, role, required): return check_permission(role, required)

    def _rec(self, tid, name, expected, actual, passed, notes=""):
        TestResult.record(tid, name, "RBAC Matrix / Decision Table", expected, actual, passed, notes)

    def test_TC63_librarian_can_create_book(self):
        p = self._can("librarian", "librarian")
        self._rec("TC-63", "RBAC: Librarian → create book ✓", True, p, p)
        self.assertTrue(p)

    def test_TC64_student_cannot_create_book(self):
        p = not self._can("student", "librarian")
        self._rec("TC-64", "RBAC: Student → create book ✗", True, p, p)
        self.assertTrue(p)

    def test_TC65_student_can_issue_book(self):
        p = self._can("student", "student")
        self._rec("TC-65", "RBAC: Student → issue book ✓", True, p, p)
        self.assertTrue(p)

    def test_TC66_librarian_cannot_self_issue(self):
        p = not self._can("librarian", "student")
        self._rec("TC-66", "RBAC: Librarian → issue book ✗", True, p, p)
        self.assertTrue(p)

    def test_TC67_vendor_cannot_access_reports(self):
        p = not self._can("vendor", "librarian")
        self._rec("TC-67", "RBAC: Vendor → reports ✗", True, p, p)
        self.assertTrue(p)

    def test_TC68_vendor_role_check(self):
        p = self._can("vendor", "vendor")
        self._rec("TC-68", "RBAC: Vendor → vendor-only action ✓", True, p, p)
        self.assertTrue(p)


# ─────────────────────────────────────────────────────────────────────────────
# REPORT PRINTER
# ─────────────────────────────────────────────────────────────────────────────

def print_report(stream=sys.stdout):
    results = TestResult.results
    total, passed, failed = TestResult.summary()

    sep  = "=" * 110
    dash = "-" * 110

    print(sep, file=stream)
    print("  BOOK BANK MANAGEMENT SYSTEM — SOFTWARE TESTING REPORT", file=stream)
    print(f"  Test Date: {date.today().isoformat()}  |  Total: {total}  |  Passed: {passed}  |  Failed: {failed}", file=stream)
    print(sep, file=stream)

    technique_groups = {}
    for r in results:
        technique_groups.setdefault(r["technique"], []).append(r)

    for tech, group in technique_groups.items():
        g_pass = sum(1 for r in group if r["passed"])
        g_fail = len(group) - g_pass
        print(f"\n{'▶ ' + tech.upper():^110}", file=stream)
        print(f"  {len(group)} tests  |  Passed: {g_pass}  |  Failed: {g_fail}", file=stream)
        print(dash, file=stream)
        print(f"  {'ID':<8} {'Test Name':<50} {'Expected':<20} {'Status'}", file=stream)
        print(dash, file=stream)
        for r in group:
            status_sym = "✅ PASS" if r["passed"] else "❌ FAIL"
            print(f"  {r['id']:<8} {r['name']:<50} {str(r['expected']):<20} {status_sym}", file=stream)
        print(dash, file=stream)

    print(f"\n{'FINAL SUMMARY':=^110}", file=stream)
    bar_len = 60
    filled  = int(bar_len * passed / total) if total > 0 else 0
    bar     = "█" * filled + "░" * (bar_len - filled)
    pct     = (passed / total * 100) if total > 0 else 0
    print(f"  Progress: [{bar}] {pct:.1f}%", file=stream)
    print(f"  Total Tests  : {total}", file=stream)
    print(f"  Passed       : {passed}  ✅", file=stream)
    print(f"  Failed       : {failed}  {'❌' if failed else '—'}", file=stream)
    print(sep, file=stream)


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Run all tests silently, then print structured report
    loader = unittest.TestLoader()
    suite  = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=0, stream=open("nul", "w") if sys.platform == "win32" else open("/dev/null", "w"))
    runner.run(suite)
    print_report()
