class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance;
    this.play = aPlay;
  }
  get amount() {
    let result = 0;

    switch (this.play.type) {
      case 'tragedy': // 비극
        result = 40000;
        if (this.performance.audience > 30) {
          result += 1000 * (this.performance.audience - 30);
        }
        break;
      case 'comedy': // 희극
        result = 30000;
        if (this.performance.audience > 20) {
          result += 10000 + 500 * (this.performance.audience - 20);
        }
        result += 300 * this.performance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${this.play.type}`);
    }
    return result;
  }
}

module.exports = function createStatementData(invoice, plays) {
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function enrichPerformance(aPerformance) {
    const calculator = new PerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    );
    const result = Object.assign({}, aPerformance); // 얕은 복사 수행
    result.play = calculator.play;
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function amountFor(aPerformance) {
    return new PerformanceCalculator(aPerformance, playFor(aPerformance))
      .amount;
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }

  function volumeCreditsFor(aPerformance) {
    let volumeCredits = 0;
    volumeCredits += Math.max(aPerformance.audience - 30, 0);
    if ('comedy' === aPerformance.play.type)
      volumeCredits += Math.floor(aPerformance.audience / 5);
    return volumeCredits;
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }
};
