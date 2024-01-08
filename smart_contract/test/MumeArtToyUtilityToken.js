const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function deployTokenFixture() {
  const [owner] = await ethers.getSigners();

  const MumeArtToyUtilityToken = await ethers.deployContract(
    "MumeArtToyUtilityToken"
  );

  // Fixtures can return anything you consider useful for your tests
  return { MumeArtToyUtilityToken, owner };
}

describe("MumeArtToyUtilityToken Contract", function () {
  it("Correct Defination", async function () {
    const { MumeArtToyUtilityToken, owner } = await loadFixture(
      deployTokenFixture
    );

    expect(await MumeArtToyUtilityToken.name()).to.equal(
      "MumeArtToyUtilityToken"
    );
    expect(await MumeArtToyUtilityToken.symbol()).to.equal("MATU");
  });
});
