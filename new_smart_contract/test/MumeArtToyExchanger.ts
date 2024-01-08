import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { toBigInt } from "ethers";
import { ethers } from "hardhat";

describe("MumeArtToyUtilityTokenExchange", function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const _MumeArtToyUtilityToken = await ethers.getContractFactory(
      "MumeArtToyUtilityToken"
    );
    const MumeArtToyUtilityToken = await _MumeArtToyUtilityToken.deploy(owner);
    await MumeArtToyUtilityToken.connect(owner).mint(
      owner,
      "10000000000000000000"
    );

    // 1eth = 1000000000000000000

    const _MumeArtToyExchanger = await ethers.getContractFactory(
      "MumeArtToyUtilityTokenExchange"
    );
    const MumeArtToyExchanger = await _MumeArtToyExchanger.deploy(
      await MumeArtToyUtilityToken.getAddress()
    );

    return { MumeArtToyUtilityToken, MumeArtToyExchanger, owner, otherAccount };
  }

  async function deployFixtureWithLP() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const _MumeArtToyUtilityToken = await ethers.getContractFactory(
      "MumeArtToyUtilityToken"
    );
    const MumeArtToyUtilityToken = await _MumeArtToyUtilityToken.deploy(owner);
    await MumeArtToyUtilityToken.connect(owner).mint(
      owner,
      "10000000000000000000"
    );

    // 1eth = 1000000000000000000

    const _MumeArtToyExchanger = await ethers.getContractFactory(
      "MumeArtToyUtilityTokenExchange"
    );
    const MumeArtToyExchanger = await _MumeArtToyExchanger.deploy(
      await MumeArtToyUtilityToken.getAddress()
    );

    const payment = "1000000000000000000";
    const tokenHold = "1000000000000000000";
    const exchangeAddr = await MumeArtToyExchanger.getAddress();
    await MumeArtToyUtilityToken.approve(
      exchangeAddr,
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );

    await MumeArtToyExchanger.addLiquidity(tokenHold, { value: payment });

    return { MumeArtToyUtilityToken, MumeArtToyExchanger, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should correct name", async function () {
      const { MumeArtToyExchanger } = await loadFixture(deployFixture);

      expect(await MumeArtToyExchanger.name()).to.equal("JBC-MATU LP Token");
    });

    it("Should correct symbol", async function () {
      const { MumeArtToyExchanger } = await loadFixture(deployFixture);

      expect(await MumeArtToyExchanger.symbol()).to.equal("MATU-LP");
    });

    it("Init LP Start", async function () {
      const { MumeArtToyUtilityToken, MumeArtToyExchanger } = await loadFixture(
        deployFixture
      );

      const payment = "1000000000000000000";
      const tokenHold = "1000000000000000000";
      const exchangeAddr = await MumeArtToyExchanger.getAddress();
      await MumeArtToyUtilityToken.approve(
        exchangeAddr,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );

      await MumeArtToyExchanger.addLiquidity(tokenHold, { value: payment });

      expect(await MumeArtToyExchanger.getReserve()).to.equal(tokenHold);
      expect(await MumeArtToyUtilityToken.balanceOf(exchangeAddr)).to.equal(
        tokenHold
      );

      expect(await ethers.provider.getBalance(exchangeAddr)).to.equal(payment);
    });

    it("Exchange JCB to COIN", async function () {
      const { MumeArtToyUtilityToken, MumeArtToyExchanger, otherAccount } =
        await loadFixture(deployFixtureWithLP);

      console.log(await MumeArtToyExchanger.getReserve());
      console.log(
        await MumeArtToyExchanger.getAmountOfTokens(
          "1000",
          toBigInt("1000000000000000000") - toBigInt("1000"),
          "1000000000000000000"
        )
      );

      await MumeArtToyExchanger.connect(otherAccount).jbcToMatu("0", {
        value: "1000",
      });

      console.log(await MumeArtToyExchanger.getReserve());
      expect.fail("Unfinished");
    });
  });
});
