import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Post } from '../types/Post'

export const usePostListStore = defineStore('postList', () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const decodeUnicode = (str: string): string => {
    try {
      return decodeURIComponent(JSON.parse('"' + str.replace(/\"/g, '\\"') + '"'));
    } catch (e) {
      return str;
    }
  }

  const processPosts = (data: any[]): Post[] => {
    return data
      .filter(post => post.id && post.title && post.excerpt && post.photo)
      .map(post => ({
        ...post,
        title: decodeUnicode(post.title),
        excerpt: decodeUnicode(post.excerpt),
        county: decodeUnicode(post.county),
        city: decodeUnicode(post.city)
      }))
  }

  const fetchPosts = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('Начало загрузки постов...')

      const response = await fetch('/api/posts')

      console.log('Статус ответа:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Полученные данные (до декодирования):', data)

      const processedPosts = processPosts(data)
      console.log('Данные после декодирования:', processedPosts)

      posts.value = processedPosts

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error fetching posts:', err)
    } finally {
      loading.value = false
    }
  }

  const getImageUrl = (photoPath: string) => {
    if (photoPath.startsWith('http')) {
      return photoPath
    }
    return `http://travelblog.skillbox.cc${photoPath}`
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    getImageUrl
  }
})