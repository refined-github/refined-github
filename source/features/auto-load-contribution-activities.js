const autoLoadContributionActivities = () => {
    document.addEventListener('scroll', () => {
        const button = document.querySelector('.contribution-activity-show-more');
    
      if (
        document.body.scrollHeight === 
        document.documentElement.scrollTop + 
        window.innerHeight
        ) {
        button.click();
      }
    });
}

export default autoLoadContributionActivities;