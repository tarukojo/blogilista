const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    var totalAmount = 0;
    const totals = blogs.map(function(blog) { 
        totalAmount = blog.likes + totalAmount 
    })
    return totalAmount
}

const mostBlogs = (blogs) => {

    const writers = blogs.map(function(blog) {
        return blog.author
    })

    var results = []

    writers.map(function(writer) {

        var writerResults = results.filter(function(result) {
            if (result.author === writer) {
                result.blogs = result.blogs + 1
                return result
            }
        }) 
        if (writerResults.length === 0) {
            results.push({ author: writer, blogs: 1})
        } 
    })

    finalResult = { author: "", blogs: 0 }

    results.map(function(result) {
        if (result.blogs > finalResult.blogs) {
            finalResult = {
                author: result.author,
                blogs: result.blogs
            }
        } 
    })

    return finalResult
} 

const mostLikes = (blogs) => {
    var results = []

    blogs.map(function(blog) {

        var writerResults = results.filter(function(result) {
            if (result.author === blog.author) {
                result.likes = result.likes + blog.likes
                return result
            }
        }) 
        if (writerResults.length === 0) {
            results.push({ author: blog.author, likes: blog.likes})
        } 
    })

    finalResult = { author: "", likes: 0 }

    results.map(function(result) {
        if (result.likes > finalResult.likes) {
            finalResult = {
                author: result.author,
                likes: result.likes
            }
        } 
    })

    return finalResult
} 
  
module.exports = {
    dummy, 
    totalLikes,
    mostBlogs,
    mostLikes
}