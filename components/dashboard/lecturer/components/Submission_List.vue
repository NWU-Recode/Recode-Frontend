<script setup lang="ts">
import { computed, ref } from 'vue'
    const submissions = [{
        id: 1,
        name: '',
        studentNo: null,
        topic: '',
        badge: '',
        time: null
    }]

</script>

<template>
    <table>
        <thead>
            <tr>
            <th>Name</th>
            <th>Student No</th>
            <th>Topic</th>
            <th>Badge</th>
            <th>Time</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="submission in submissions" :key="submission.id">
            <td>{{ submission.name }}</td>
            <td>{{ submission.studentNo }}</td>
            <td>{{ submission.topic }}</td>
            <td>{{ submission.badge }}</td>
            <td>{{ submission.time }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: #333;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    thead {
        background: linear-gradient(90deg, #6a5acd, #ff69b4);
        color: white;
        text-align: left;
    }

    thead th {
        padding: 14px 16px;
        font-weight: 500;
    }

    tbody tr {
        border-bottom: 1px solid #f0f0f0;
        transition: background 0.2s ease;
    }

    tbody tr:hover {
        background: #fafafa;
    }

    tbody td {
        padding: 12px 16px;
        color: #444;
    }

    tbody tr:last-child {
        border-bottom: none;
    }

    thead th:first-child {
        border-top-left-radius: 8px;
    }
    thead th:last-child {
        border-top-right-radius: 8px;
    }
</style>