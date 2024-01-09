import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { toBigInt } from "ethers";

describe("MumeArtToyUtilityToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const _MumeArtToyUtilityToken = await ethers.getContractFactory(
      "MumeArtToyUtilityToken"
    );
    const MumeArtToyUtilityToken = await _MumeArtToyUtilityToken.deploy(owner);

    return { MumeArtToyUtilityToken, owner, otherAccount };
  }

  async function deployWithMintedFixture() {
    // Contracts are deployed using the first signer/account by default
    const { MumeArtToyUtilityToken, owner, otherAccount } =
      await deployFixture();
    await MumeArtToyUtilityToken.connect(owner).mint(otherAccount, "1000");
    await MumeArtToyUtilityToken.connect(owner).mint(owner, "1000");

    return { MumeArtToyUtilityToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should correct name", async function () {
      const { MumeArtToyUtilityToken } = await loadFixture(deployFixture);

      expect(await MumeArtToyUtilityToken.name()).to.include(
        "MumeArtToyUtilityToken"
      );
    });

    it("Should correct signature", async function () {
      const { MumeArtToyUtilityToken } = await loadFixture(deployFixture);

      expect(await MumeArtToyUtilityToken.symbol()).to.include("MATU");
    });

    describe("Mint", async function () {
      it("Admin can mint", async function () {
        const { MumeArtToyUtilityToken, owner } = await loadFixture(
          deployFixture
        );

        const oldBalance = await MumeArtToyUtilityToken.balanceOf(owner);

        const mintValue = "1000";
        await MumeArtToyUtilityToken.connect(owner).mint(owner, mintValue);

        const newBalance = await MumeArtToyUtilityToken.balanceOf(owner);
        expect(newBalance).to.equal(oldBalance + mintValue);
      });

      it("Admin can mint to other", async function () {
        const { MumeArtToyUtilityToken, owner, otherAccount } =
          await loadFixture(deployFixture);

        const oldBalance = await MumeArtToyUtilityToken.balanceOf(otherAccount);

        const mintValue = "1000";
        await MumeArtToyUtilityToken.connect(owner).mint(
          otherAccount,
          mintValue
        );

        const newBalance = await MumeArtToyUtilityToken.balanceOf(otherAccount);
        expect(newBalance).to.equal(oldBalance + mintValue);
      });

      it("Non-admin can't mint", async function () {
        const { MumeArtToyUtilityToken, otherAccount } = await loadFixture(
          deployFixture
        );

        const mintValue = "1000";

        try {
          await MumeArtToyUtilityToken.connect(otherAccount).mint(
            otherAccount,
            mintValue
          );

          expect.fail("Should Error");
        } catch (err) {
          // It OK
        }
      });
    });

    describe("Transfer", async function () {
      it("Can trasfer", async function () {
        const { MumeArtToyUtilityToken, owner, otherAccount } =
          await loadFixture(deployWithMintedFixture);

        const transferValue = "200";

        const oldBalanceA = await MumeArtToyUtilityToken.balanceOf(owner);
        const oldBalanceB = await MumeArtToyUtilityToken.balanceOf(
          otherAccount
        );

        await MumeArtToyUtilityToken.connect(owner).transfer(
          otherAccount,
          transferValue
        );

        const newBalanceA = await MumeArtToyUtilityToken.balanceOf(owner);
        const newBalanceB = await MumeArtToyUtilityToken.balanceOf(
          otherAccount
        );

        expect(newBalanceA).to.equal(oldBalanceA - toBigInt(transferValue));
        expect(newBalanceB).to.equal(oldBalanceB + toBigInt(transferValue));
      });
    });
  });
});
