/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai')
const battle = require('./battle')

// This function is the core of the bot behaviour
const replyMessage = (message) => {

  // Instantiate Recast.AI SDK, just for request service
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)

  // Get text from message received
  const text = message.content
  console.log('I receive: ', text)

  // Get senderId to catch unique conversation_token
  const senderId = message.senderId

  // Call Recast.AI SDK, through /converse route
  request.converseText(text, { conversationToken: senderId })
  .then(result => {
    /*
    * Here, you can add your own process.
    * Ex: You can call any external API
    * Or: Update your mongo DB
    * etc...
    */
    if (result.action) {
      console.log('The conversation action is: ', result.action.slug)
    }

    // Add each replies received from API to replies stack
    result.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }))

    // Send all replies
    message.reply()
    .then(() => {
      if (result.action && result.action.done) {
        if (result.action.slug === 'battle') {
          battle(result, result.getMemory('repo-1').raw, result.getMemory('repo-2').raw)
            .then(res => {
              message.addReply(res)
              message.addReply({ type: 'text', content: 'Do you want more informations?'})
              message.reply()
            })
        } else if (result.action.slug === 'agree') {
          const winner = result.getMemory('winner')
          message.addReply({
            type: 'card',
            content: {
              title: winner.name,
              subtitle: winner.stars,
              imageUrl: 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png',
              buttons: [
                {
                  title: 'More informations',
                  type: 'web_url',
                  value: winner.url,
                }
              ],
            },
          })
          message.reply()
        }
      }
    })
    .catch(err => {
      console.error('Error while sending message to channel', err)
    })
  })
  .catch(err => {
    console.error('Error while sending message to Recast.AI', err)
  })
}

module.exports = replyMessage