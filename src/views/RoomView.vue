<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import io from 'socket.io-client'
import { useRoute } from 'vue-router'

const route = useRoute()

const socket = io('http://localhost:3000/chat')
const nickname = route.query.nickname

const canvasSize = 400
const sections = 8
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
const friction = 0.987
const maxSpeed = 20

const canvasRef = useTemplateRef('roulette')

const spinning = ref(false)
const currentAngle = ref(0)
const speed = ref(0)

const message = ref<string>('')
const messages = ref<{ message: string; nickname?: string; isMe?: boolean }[]>([])

socket.on('connect', () => {
  console.log('connected')
})

socket.on('message', (message) => {
  const [nickname, ...msg] = message.split(':')
  messages.value.push({ nickname, message: msg.join('') })
})

function getRadian(degree: number) {
  return (degree * Math.PI) / 180
}

function drawRoulette() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const centerX = canvasSize / 2
  const centerY = canvasSize / 2
  const radius = canvasSize / 2 - 10
  const sliceAngle = (2 * Math.PI) / sections

  for (let i = 0; i < sections; i++) {
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
    ctx.fillText(`${i}`, 0, 0)
    ctx.restore()
  }
}

function animateRoulette() {
  if (!spinning.value) return

  speed.value *= friction
  if (speed.value < 0.1) {
    spinning.value = false
    speed.value = 0
    return
  }

  currentAngle.value = (currentAngle.value + speed.value) % 360

  drawRoulette()

  requestAnimationFrame(animateRoulette)
}

function spinRoulette() {
  if (spinning.value) return
  spinning.value = true
  speed.value = Math.max(speed.value, 50)
  animateRoulette()
}

function boostSpin() {
  if (!spinning.value) return
  speed.value = Math.min(speed.value + 5, maxSpeed)
}

function slowDownSpin() {
  if (!spinning.value) return
  speed.value = Math.max(speed.value - 2, 0)
}

function sendMessage() {
  socket.emit('message', { nickname, message: message.value })
  messages.value.push({ isMe: true, message: message.value })
}

onMounted(() => {
  drawRoulette()
})
</script>

<template>
  <div class="about">
    <h1>돌려 돌려 돌림판</h1>
    <canvas ref="roulette" :width="canvasSize" :height="canvasSize"></canvas>
  </div>
  <div>
    <button @click="spinRoulette">돌리기</button>
    <button @click="boostSpin">속도 증가</button>
    <button @click="slowDownSpin">속도 감소</button>
  </div>
  <div>
    <input v-model="message" placeholder="채팅" />
    <button @click="sendMessage">보내기</button>
  </div>
  <ul>
    <template v-for="msg in messages" :key="msg.message">
      <li v-if="!msg.isMe">
        <span>{{ msg.nickname }}</span> : {{ msg.message }}
      </li>
      <li v-if="msg.isMe" class="me">
        {{ msg.message }}
      </li>
    </template>
  </ul>
</template>

<style scoped>
.me {
  background-color: beige;
  text-align: right;
}
</style>
