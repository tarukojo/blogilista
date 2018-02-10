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
  
module.exports = {
    dummy, 
    totalLikes
}