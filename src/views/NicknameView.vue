<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const roomId = route.params.roomId

const nickname = ref('')

function onSave() {
  if (nickname.value.trim().length === 0) {
    alert('닉네임은 한 글자 이상 입력해주세요')
    return
  }

  sessionStorage.setItem('nickname', nickname.value)

  router.replace(`/room/${roomId}`)
}
</script>

<template>
  <label for="nickname">닉네임</label>
  <input id="nickname" v-model="nickname" placeholder="닉네임을 입력해주세요" />
  <button @click="onSave">저장</button>
</template>
