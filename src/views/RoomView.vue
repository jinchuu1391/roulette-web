<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import io from 'socket.io-client'
import { useRoute } from 'vue-router'

const route = useRoute()

const roomId = route.params.roomId

const socket = io('http://localhost:3000/room')

const canvasSize = 400

const colors = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#FF33A1',
  '#FFC300',
  '#DAF7A6',
  '#900C3F',
  '#581845',
]

const canvasRef = useTemplateRef('roulette')

const nickname = ref(sessionStorage.getItem('nickname') || '')
const spinning = ref(false)
const currentAngle = ref(0)
const speed = ref(0)

const message = ref<string>('')
const messages = ref<{ message: string; nickname?: string; isMe?: boolean; isNotice?: boolean }[]>(
  [],
)
const options = ref<string[]>([])

socket.on('connect', () => {
  socket.emit('joinRoom', { roomId, nickname: nickname.value })
})

socket.on('message', (message) => {
  const [nickname, ...msg] = message.split(':')
  messages.value.push({ nickname: nickname.value, message: msg.join('') })
})

socket.on('notice', (message) => {
  messages.value.push({ message, isNotice: true })
})

socket.on('options', (optionsFromServer) => {
  options.value = optionsFromServer
})

socket.on('error', (errorMessage) => {
  alert(errorMessage)
})

socket.on('rouletteState', (roomState) => {
  speed.value = roomState.speed
  currentAngle.value = roomState.currentAngle
  spinning.value = roomState.spinning

  if (!spinning.value) return

  requestAnimationFrame(() => drawRoulette(options.value))
})

socket.on('speedChange', (speed) => {
  speed.value = speed
})

function getRadian(degree: number) {
  return (degree * Math.PI) / 180
}

function drawRoulette(sections: string[]) {
  const canvas = canvasRef.value
  const sectionsLength = sections.length
  if (!canvas || typeof sectionsLength !== 'number') return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const centerX = canvasSize / 2
  const centerY = canvasSize / 2
  const radius = canvasSize / 2 - 10
  const sliceAngle = (2 * Math.PI) / sectionsLength

  for (let i = 0; i < sectionsLength; i++) {
    const startAngle = i * sliceAngle + getRadian(currentAngle.value)
    const endAngle = (i + 1) * sliceAngle + getRadian(currentAngle.value)

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]
    ctx.fill()

    const textAngle = startAngle + sliceAngle / 2
    const textX = centerX + (radius / 1.5) * Math.cos(textAngle)
    const textY = centerY + (radius / 1.5) * Math.sin(textAngle)

    ctx.save()
    ctx.translate(textX, textY)
    ctx.rotate(textAngle + Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#000'
    ctx.font = '16px Arial'
    ctx.fillText(`${sections[i]}`, 0, 0)
    ctx.restore()
  }
}

function spinRoulette() {
  if (spinning.value) return
  socket.emit('spinRoulette', { roomId })
}

function boostSpin() {
  socket.emit('speedUp', { roomId })
}

function slowDownSpin() {
  socket.emit('speedDown', { roomId })
}

function handleChat() {
  socket.emit('message', { nickname: nickname.value, message: message.value, roomId })
  messages.value.push({ isMe: true, message: message.value })
  message.value = ''
}

watch(options, () => {
  drawRoulette(options.value)
})
</script>

<template>
  <div class="about">
    <h1>돌려 돌려 돌림판</h1>
    <canvas ref="roulette" :width="canvasSize" :height="canvasSize"></canvas>
  </div>
  <div>
    <button :disabled="spinning" @click="spinRoulette">돌리기</button>
    <button :disabled="!spinning" @click="boostSpin">속도 증가</button>
    <button :disabled="!spinning" @click="slowDownSpin">속도 감소</button>
  </div>
  <div>
    <input v-model="message" placeholder="채팅" />
    <button @click="handleChat">보내기</button>
  </div>
  {{ options }}
  <ul>
    <template v-for="msg in messages" :key="msg.message">
      <li v-if="msg.isMe" class="me">
        {{ msg.message }}
      </li>
      <li v-else-if="msg.isNotice" class="notice">
        {{ msg.message }}
      </li>
      <li v-else>
        <span>{{ msg.nickname }}</span> : {{ msg.message }}
      </li>
    </template>
  </ul>
</template>

<style scoped>
.me {
  background-color: beige;
  text-align: right;
}
.notice {
  color: blue;
}
button:disabled {
  background-color: grey;
}
</style>
