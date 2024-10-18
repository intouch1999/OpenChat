<template>
    <div class="container bg-secondary mx-auto w-3/4 p-4 rounded-lg">
        <div class="text-center text-2xl font-bold mb-4">
            <span>Build for GroqAi</span>
        </div>
        <div class="relative flex items-center justify-center">
    <textarea :disabled="loading" v-model="Promt" @keydown="disableEnter($event)" @keyup.enter="handlesendMess()"
      input="adjustHeight($event.target)" style="height: auto;" type="text"
      class="overflow-hidden input input-bordered input-sm input-primary w-full max-w-xs pr-12 resize-none"
      placeholder="Enter your message..." />
    <button :disabled="loading" @click="handlesendMess()" class="ml-2 justify-center btn btn-sm bg-transparent border-none">
      <span v-if="loading" class="loading loading-spinner loading-xs"></span>
      <svg v-else  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    </button>
  </div>
        <div v-for="(i, index) in Mess.slice().reverse()" :key="index" class="">
            <div class="chat chat-end">
                <div class="chat-header">
                    You!
                </div>
                <div class="chat-bubble">
                    <div>{{ i.i }}</div>
                </div>
                <div class="chat-footer opacity-50">{{ i.time }}</div>
            </div>
            <div class="chat chat-start">
                <div class="chat-header">
                    Ai!
                </div>
                <div class="chat-bubble w-full flex justify-center">
                    <textarea v-model="i.u" readonly
                        class="p-4 w-full bg-transparent resize-none border-none focus:outline-none" ref="textareaRef"
                        @vue:mounted="initResize($event.target)"></textarea>
                </div>
                <div class="chat-footer opacity-50">{{ i.time }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
const Promt = useState('chat', () => null)
const Mess = useState('mess', () => [])
const loading = useState('loading', () => false)

const adjustHeight = (element) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
};

const initResize = (element) => {
    nextTick(() => {
        adjustHeight(element);
    });
};

const disableEnter = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        console.log('Enter key disabled');
      }
    }

// แปลง Mess เป็นรูปแบบที่เหมาะสมสำหรับส่งเป็น history
const createHistory = () => {
    return Mess.value.map(msg => ({
        role: 'human',
        content: msg.i,
        response: msg.u
    }));
}

const handlesendMess = async () => {
    const messed = {
        i: Promt.value,
        u: '',
        time: new Date().getHours() + ':' + new Date().getMinutes()
    }
    loading.value = true;
    Mess.value.push(messed);

    const { data: chat, error } = await useFetch('/api/ai', {
        method: 'POST',
        body: { 
            message: Promt.value,
            history: createHistory() // เพิ่มการส่ง history
        }
    })

    if (!error.value && chat.value) {
        messed.u = chat.value.message;
        Promt.value = '';

        nextTick(() => {
            document.querySelectorAll('textarea').forEach(textarea => {
                adjustHeight(textarea);
            });
        });
    } else {
        console.error('Error fetching data from API:', error.value);
    }
    Promt.value = '';

    setTimeout(() => {
        loading.value = false;
    }, 1000);
}
</script>