const rp = require('request-promise')

const githubCall = (repo) => {
  var options = {
    url: `https://api.github.com/search/repositories?q=${repo}`,
    headers: {
      'User-Agent': process.env.GITHUB_USERNAME,
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    }
  }

  return rp(options).then(result => {
    const body = JSON.parse(result)
    return {
      name: body.items[0].full_name,
      stars: body.items[0].stargazers_count,
      url: body.items[0].html_url,
    }
  })
}

const getWinner = (repo1, repo2) => {
  const winner = repo1.stars > repo2.stars ? repo1 : repo2
  const looser = repo1.stars > repo2.stars ? repo2 : repo1

  const reply = `${winner.name} got more stars (${winner.stars}) than ${looser.name} (${looser.stars})`

  result.setMemory({ winner })

  return reply
}

const battle = (repo1, repo2) => {
  return Promise.all([
    githubCall(repo1),
    githubCall(repo2),
  ]).then(repos => {
    return { type: 'text', content: getWinner(result, repos[0], repos[1]) }
  })
}

module.exports = battle
