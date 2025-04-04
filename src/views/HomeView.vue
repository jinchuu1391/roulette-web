<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'

type FormErros = {
  nickname?: string
  options?: string
} | null

const router = useRouter()

const nickname = ref('')
const optionCandidate = ref('')
const options = ref<string[]>([])
const formErrors = ref<FormErros>(null)

const roomSocket = io('http://localhost:3000/room')

function submit(e: Event) {
  e.preventDefault()
  if (!validateForm()) {
    return
  }

  sessionStorage.setItem('nickname', nickname.value)

  const roomId = uuidv4()

  createRoomOnServer(roomId)

  router.push({
    name: 'room',
    params: { roomId },
  })
}

function createRoomOnServer(roomId: string) {
  roomSocket.emit('createRoom', { roomId, leader: nickname.value, options: options.value })
}

function validateForm() {
  formErrors.value = null

  const newFormErros: FormErros = {}

  const isNicknameValid = isValidText(nickname.value)
  if (!isNicknameValid) {
    newFormErros.nickname = '닉네임을 입력해주세요'
  }

  const isOptionsValid = options.value.length >= 2
  if (!isOptionsValid) {
    newFormErros.options = '2개 이상의 옵션을 등록해주세요'
  }

  formErrors.value = newFormErros

  return isNicknameValid && isOptionsValid
}

function isValidText(text: string) {
  return text.trim().length > 0
}

function addOption() {
  if (!isValidText(optionCandidate.value)) {
    return
  }
  options.value.push(optionCandidate.value)
  optionCandidate.value = ''
}
</script>

<template>
  <h1>돌림판</h1>
  <div>
    <label for="nickname">닉네임</label>
    <input autofocus id="nickname" v-model="nickname" />
  </div>
  <p v-if="formErrors?.nickname">{{ formErrors.nickname }}</p>
  <div>
    <label for="option">옵션</label>
    <input id="option" v-model="optionCandidate" @keyup.enter="addOption" />
    <button @click="addOption">추가</button>
  </div>
  <ul>
    <li v-for="option in options" :key="option">{{ option }}</li>
  </ul>
  <p v-if="formErrors?.options">{{ formErrors.options }}</p>
  <button @click="submit">방 만들기</button>
</template>
