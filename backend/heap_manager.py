import heapq
import time
import logging

logger = logging.getLogger(__name__)

class TriageHeap:
    """
    Manages the In-Memory Priority Queue for the Emergency Room.
    Uses Python's built-in heapq (Min-Heap) inverted to act as a Max-Heap.
    """
    def __init__(self):
        # Heap elements will be tuples: (-severity_score, arrival_timestamp, patient_id)
        # 1st item (-score): Primary sort (Highest score becomes lowest negative number)
        # 2nd item (timestamp): Tie-breaker (Earlier arrival wins if scores are equal)
        # 3rd item (patient_id): The actual payload we use to fetch DB records
        self.heap = []

    def sync_from_db(self, waiting_patients):
        """
        Hydrates the heap from PostgreSQL when the server starts.
        Ensures the real-time queue survives server restarts.
        """
        self.heap = []
        for p in waiting_patients:
            # Note: We use the timestamp as the tie-breaker
            element = (-p.severity_score, p.arrival_time.timestamp(), p.id)
            self.heap.append(element)
        
        # heapify runs in O(n) time, making it highly efficient for startup
        heapq.heapify(self.heap)
        logger.info(f"Heap synced with {len(self.heap)} patients.")

    def insert(self, patient_id, score, arrival_time):
        """
        Inserts a new patient into the Max-Heap.
        Time Complexity: O(log n) - fulfills coursework requirement.
        """
        element = (-score, arrival_time.timestamp(), patient_id)
        heapq.heappush(self.heap, element)

    def extract_next(self):
        """
        Extracts and removes the highest priority patient from the queue.
        Time Complexity: O(log n) - fulfills coursework requirement.
        """
        if self.heap:
            # Pop the root element and return the patient_id (index 2)
            top_element = heapq.heappop(self.heap)
            return top_element[2]
        return None

    def get_top_patient_id(self):
        """
        Peeks at the highest priority patient without removing them.
        Time Complexity: O(1)
        """
        if self.heap:
            return self.heap[0][2]
        return None

    def get_sorted_ids(self):
        """
        Returns a list of all patient IDs currently waiting, in priority order.
        Used for broadcasting the live queue to the React monitors.
        Time Complexity: O(n log n) due to sorting, but safe for typical ER queue sizes.
        """
        # sorted() does not destroy the original heap
        return [item[2] for item in sorted(self.heap)]

    def escalate_priorities(self, threshold_seconds=1800, score_bump=5.0):
        """
        Scans the heap for patients who have waited longer than the threshold.
        Increases their priority score to ensure they don't wait forever.
        
        :param threshold_seconds: How long before a patient gets bumped (e.g., 1800s = 30 mins)
        :param score_bump: How much to increase the ATSS score by.
        :return: Boolean indicating if any changes were made.
        """
        if not self.heap:
            return False

        now = time.time()
        updated = False

        # Iterate through the underlying array
        for i in range(len(self.heap)):
            neg_score, arrival_timestamp, patient_id = self.heap[i]
            
            wait_time = now - arrival_timestamp
            
            if wait_time > threshold_seconds:
                # Patient has waited too long! 
                # To increase the score, we subtract from the negative value
                new_neg_score = neg_score - score_bump
                
                # Update the tuple in the array
                self.heap[i] = (new_neg_score, arrival_timestamp, patient_id)
                updated = True
                
                logger.info(f"Escalated Patient {patient_id}. Wait time: {int(wait_time/60)} mins.")

        if updated:
            # If we changed values, the heap property might be violated.
            # We must re-balance the entire tree. O(n) operation.
            heapq.heapify(self.heap)

        return updated