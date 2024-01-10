import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { toBigInt } from "ethers";

describe("MumeArtToyMuToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const _MumeArtToyMuToken = await ethers.getContractFactory(
      "MumeArtToyMuToken"
    );
    const MumeArtToyMuToken = await _MumeArtToyMuToken.deploy(owner);

    return { MumeArtToyMuToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should correct name", async function () {
      const { MumeArtToyMuToken } = await loadFixture(deployFixture);

      expect(await MumeArtToyMuToken.name()).to.include("MumeArtToyMuToken");
    });

    it("Should correct signature", async function () {
      const { MumeArtToyMuToken } = await loadFixture(deployFixture);

      expect(await MumeArtToyMuToken.symbol()).to.include("MAT-MU");
    });

    describe("Mint", async function () {
      it("Admin can mint freely", async function () {
        const { MumeArtToyMuToken, owner } = await loadFixture(deployFixture);

        const oldBalance = await MumeArtToyMuToken.balanceOf(owner);

        const mintValue = "1000";
        await MumeArtToyMuToken.connect(owner).mint(owner, mintValue);

        const newBalance = await MumeArtToyMuToken.balanceOf(owner);
        expect(newBalance).to.equal(oldBalance + mintValue);
      });

      it("Admin can mint to other", async function () {
        const { MumeArtToyMuToken, owner, otherAccount } = await loadFixture(
          deployFixture
        );

        const oldBalance = await MumeArtToyMuToken.balanceOf(otherAccount);

        const mintValue = "1000";
        await MumeArtToyMuToken.connect(owner).mint(otherAccount, mintValue);

        const newBalance = await MumeArtToyMuToken.balanceOf(otherAccount);
        expect(newBalance).to.equal(oldBalance + mintValue);
      });

      it("Non-admin can't mint", async function () {
        const { MumeArtToyMuToken, otherAccount } = await loadFixture(
          deployFixture
        );

        const mintValue = "1000";

        try {
          await MumeArtToyMuToken.connect(otherAccount).mint(
            otherAccount,
            mintValue
          );

          expect.fail("Should Error");
        } catch (err) {
          // It OK to error
        }
      });
    });

    describe("Mint Exchange", async function () {
      const convertRates = [
        10n ** 19n,
        5n * 10n ** 18n,
        10n ** 18n,
        5n * 10n ** 17n,
        10n ** 17n,
      ];
      const feeRates = [0n * 10n ** 6n, 15n * 10n ** 5n, 3n * 10n ** 6n];
      const initialPayments = [
        toBigInt("1000000"),
        toBigInt("5000000"),
        toBigInt("10000000"),
        toBigInt("25000000"),
      ];

      let n = 0;

      for (let i = 0; i < convertRates.length; i++) {
        for (let j = 0; j < feeRates.length; j++) {
          for (let k = 0; k < initialPayments.length; k++) {
            const testConvertRate = convertRates[i];
            const testFeeRate = feeRates[j];
            const paymentValue = initialPayments[k];
            n += 1;
            it(`Can mint exchange Case [${n}]`, async function () {
              const { MumeArtToyMuToken, owner, otherAccount } =
                await loadFixture(deployFixture);
              console.log("conversationRate", testConvertRate);
              console.log("feeRate", testFeeRate);
              console.log("paymentValue", paymentValue);

              await MumeArtToyMuToken.connect(owner).setConversationRate(
                testConvertRate
              );
              await MumeArtToyMuToken.connect(owner).setFeeRate(testFeeRate);

              const conversationRate =
                await MumeArtToyMuToken.conversationRate();
              expect(conversationRate).to.equal(testConvertRate);

              const feeRate = await MumeArtToyMuToken.feeRate();
              expect(feeRate).to.equal(testFeeRate);

              const fee = (paymentValue * feeRate) / 10n ** 8n;
              console.log("fee", fee);

              const remainValue = paymentValue - fee;
              console.log("remainValue", remainValue);

              const exceptValue = (remainValue * conversationRate) / 10n ** 18n;
              console.log("exceptValue", exceptValue);

              for (const account of [owner, otherAccount]) {
                await MumeArtToyMuToken.connect(account).exchangeMint({
                  value: paymentValue,
                });

                const newBalance = await MumeArtToyMuToken.balanceOf(account);
                console.log("actualValue", newBalance);
                expect(newBalance).to.equal(exceptValue);
              }
            });
          }
        }
      }
    });

    async function deployWithMintedFixture() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();

      const _MumeArtToyMuToken = await ethers.getContractFactory(
        "MumeArtToyMuToken"
      );
      const MumeArtToyMuToken = await _MumeArtToyMuToken.deploy(owner);
      await MumeArtToyMuToken.connect(owner).mint(owner, "100000");
      await MumeArtToyMuToken.connect(owner).mint(otherAccount, "100000");

      return { MumeArtToyMuToken, owner, otherAccount };
    }

    describe("Transfer", async function () {
      it("Can trasfer", async function () {
        const { MumeArtToyMuToken, owner, otherAccount } = await loadFixture(
          deployWithMintedFixture
        );

        const transferValue = "200";

        const oldBalanceA = await MumeArtToyMuToken.balanceOf(owner);
        const oldBalanceB = await MumeArtToyMuToken.balanceOf(otherAccount);

        await MumeArtToyMuToken.connect(owner).transfer(
          otherAccount,
          transferValue
        );

        const newBalanceA = await MumeArtToyMuToken.balanceOf(owner);
        const newBalanceB = await MumeArtToyMuToken.balanceOf(otherAccount);

        expect(newBalanceA).to.equal(oldBalanceA - toBigInt(transferValue));
        expect(newBalanceB).to.equal(oldBalanceB + toBigInt(transferValue));
      });
    });
  });
});
