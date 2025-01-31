import { render } from '@testing-library/vue'
import HomeView from '@/views/HomeView.vue'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { vi } from 'vitest'

const setup = () => {
  const utils = render(HomeView)
  const nicknameInput = utils.getByLabelText('닉네임')
  const optionInput = utils.getByLabelText('옵션')
  const addButton = utils.getByRole('button', { name: '추가' })
  const submitButton = utils.getByRole('button', { name: '방 만들기' })
  const user = userEvent.setup()

  return {
    nicknameInput,
    optionInput,
    addButton,
    submitButton,
    user,
    ...utils,
  }
}

test('닉네임을 입력하지 않고 방 만들기 클릭시 닉네임 에러 메시지 표시', async () => {
  const { user, submitButton, getByText } = setup()

  await user.click(submitButton)

  expect(getByText('닉네임을 입력해주세요')).toBeTruthy()
})

test('닉네임만 입력 후 방 만들기 버튼 클릭시 옵션 관련 에러 메시지 표시', async () => {
  const { user, nicknameInput, submitButton, getByText } = setup()

  await user.type(nicknameInput, 'any-nickname')
  await user.click(submitButton)

  expect(getByText('2개 이상의 옵션을 등록해주세요')).toBeTruthy()
})

test('옵션 하나만 추가하고 방 만들기 클릭시 여전히 옵션 개수 부족 메시지 표시', async () => {
  const { user, nicknameInput, optionInput, addButton, submitButton, getByText } = setup()

  await user.type(nicknameInput, 'any-nickname')
  await user.type(optionInput, 'option1')
  await user.click(addButton)
  await user.click(submitButton)

  expect(getByText('2개 이상의 옵션을 등록해주세요')).toBeTruthy()
})

test('옵션 입력 중 Enter 누르면 옵션이 등록되어야 한다', async () => {
  const { user, optionInput, getByText } = setup()

  await user.type(optionInput, 'first option')
  await user.keyboard('[Enter]')

  expect(optionInput.value).toBe('')
  expect(getByText('first option')).toBeTruthy()

  await user.type(optionInput, 'second option')
  await user.keyboard('[Enter]')

  expect(optionInput.value).toBe('')
  expect(getByText('second option')).toBeTruthy()
})

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

test('유효성 검증을 통과한 상태에서 방 만들기 버튼을 누르면 페이지 이동', async () => {
  const { user, nicknameInput, optionInput, addButton, submitButton } = setup()

  await user.type(nicknameInput, 'any-nickname')
  await user.type(optionInput, 'option1')
  await user.click(addButton)
  await user.type(optionInput, 'option2')
  await user.click(addButton)
  await user.click(submitButton)

  expect(mockPush).toHaveBeenCalled()
  expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ name: 'room' }))
})
