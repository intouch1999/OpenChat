<template>
    <div class="container bg-secondary mx-auto w-11/12 md:w-3/4 p-4 rounded-lg mb-20 min-h-[75vh] h-auto overflow-auto">
        <div class=" bg-primary flex justify-start items-end mb-8 rounded-b-3xl">
            <div class=" absolute top-20 buttom-0 overflow-visible  rounded-full px-4 py-2 bg-primary z-50">
                <span class=" bg-primary rounded-full px-4 py-2 text-primary-content font-bold text-xl">{{ displayText
                    }}<span class="inline-block w-2 h-0.5 bg-black rounded-full blink-animation "></span></span>
            </div>
        </div>
        <div v-for="(i, index) in Mess.slice().reverse()" :key="index" class="">
            <div class="chat chat-end">
                <div class="chat-header mr-2">
                    You!
                </div>
                <div class="chat-bubble chat-bubble-primary">
                    <div>{{ i.i }}</div>
                </div>
                <div class="chat-footer opacity-50">{{ i.time }}</div>
            </div>
            <div class="chat chat-start">
                <div class="chat-header ml-2">
                    Ai!
                </div>
                <div class="chat-bubble w-full flex justify-center">
                    <textarea v-model="i.u" readonly
                        class="p-2 w-full bg-transparent resize-none border-none focus:outline-none" ref="textareaRef"
                        @vue:mounted="initResize($event.target)"></textarea>
                </div>
                <div class="chat-footer opacity-50">{{ i.time }}</div>
            </div>
        </div>
    </div>
    <div class="fixed bottom-0 inset-x-0 bg-primary w-full mx-auto rounded-t-3xl  ">
        <div class="flex justify-center flex-row w-full">
            <div class="relative my-2 md:m-2 flex flex-row align-middle items-end justify-center w-3/4">
                <textarea v-model="Promt" @keydown="justEnter($event)" @input="adjustHeight($event.target)"
                    style="height: auto;" type="text"
                    class="max-h-72 input input-bordered input-sm md:input-lg w-full input-primary p-2 resize-none"
                    placeholder="Enter your message..." />
                <button :disabled="loading || !Promt" @click="handlesendMess()"
                    class="absolute disabled:opacity-50 hover:bg-white action:scale-110 transition-colors duration-200 -right-10 md:-right-12 bottom-2 ml-2 mb-1 flex items-center justify-center rounded-full bg-secondary border-none w-10 h-10 md:w-12 md:h-12">

                    <div v-if="loading" class="flex items-center justify-center">
                        <span class="loading loading-spinner loading-xs md:loading-md"></span>
                    </div>

                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6 md:w-8 md:h-8">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

                </button>

            </div>
        </div>
    </div>

</template>

<script setup>
const Promt = useState('chat', () => null)
const Mess = useState('mess', () => [])
const loading = useState('loading', () => false)
const displayText = useState('displayText', () => '')

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


const disabledEnter = (event) => {
    const isEnterPressed = event.key === 'Enter' && !event.shiftKey;
    if (isEnterPressed) {
        event.preventDefault();
    }
}

const justEnter = (event) => {
    const isEnterPressed = event.key === 'Enter' && !event.shiftKey;
    const isResolutionAbove768 = window.innerWidth > 768;
    const isInputEmpty = event.target.value.trim() === '';

    if (isEnterPressed && isResolutionAbove768 && !isInputEmpty) {
        event.preventDefault();
        handlesendMess();
    }
};


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
            history: createHistory()
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

const typingEffect = (text) => {
    displayText.value = '';
    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            displayText.value += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 100);
};

onMounted(() => {
    typingEffect('# GroqAI');
});
</script>

<style scoped>
@keyframes blink {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.blink-animation {
    animation: blink 1.5s infinite;
}
</style>