let scrolling = false

const autoLoadContributionActivities = () => {
    const button = document.querySelector('.contribution-activity-show-more')
    console.log('scrolling: ', scrolling)
    if (!scrolling) {
        scrolling = true 
        console.log('scrolling: ', scrolling)
        setTimeout(() => {
            button.click()
            scrolling = false
        }, 2000)
    }
}

export default autoLoadContributionActivities;